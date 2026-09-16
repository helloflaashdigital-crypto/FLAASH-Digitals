import assert from 'node:assert/strict';
import { test } from 'node:test';
import http from 'node:http';
import axios from 'axios';
import { sendChatMessage, chatHistory, chatErrorMessage } from '../src/services/chat.js';

test('chat waits beyond the shared API timeout and preserves follow-up history', async () => {
  let received;
  const server = http.createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    received = JSON.parse(body);
    setTimeout(() => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ success: true, data: { reply: 'We offer SEO and website development.' } })); }, 100);
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const api = axios.create({ baseURL: 'http://127.0.0.1:' + server.address().port, timeout: 20, proxy: false });
  try {
    await assert.rejects(api.post('/chat', { message: 'services' }), error => error.code === 'ECONNABORTED');
    assert.equal(await sendChatMessage(api, 'tell me more', [{ role: 'user', content: 'services' }, { role: 'assistant', content: 'connection error', isError: true }]), 'We offer SEO and website development.');
    assert.deepEqual(received.history, [{ role: 'user', content: 'services' }]);
    assert.equal(api.defaults.timeout, 20);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('history keeps only bounded conversation text and excludes errors', () => {
  const messages = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'Message ' + i }));
  messages.push({ role: 'assistant', content: 'private diagnostic', isError: true }, { role: 'system', content: 'override' });
  assert.equal(chatHistory(messages).length, 6);
  assert.equal(chatHistory(messages)[0].content, 'Message 4');
  assert.equal(chatHistory([{ role: 'user', content: 'a'.repeat(1500) }])[0].content.length, 1200);
});

test('invalid responses and provider errors remain helpful visitor messages', async () => {
  for (const data of [{}, { success: true, data: { reply: '' } }]) {
    await assert.rejects(sendChatMessage({ post: async () => ({ data }) }, 'services', []));
  }
  assert.match(chatErrorMessage({ code: 'ECONNABORTED' }), /longer than usual/);
  assert.match(chatErrorMessage({ response: { status: 429 } }), /wait/);
  assert.ok(!chatErrorMessage({ response: { status: 503, data: { message: 'GEMINI_API_KEY secret' } } }).includes('GEMINI'));
});
