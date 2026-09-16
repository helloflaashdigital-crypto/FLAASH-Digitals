import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createChatHandler } from '../src/controllers/chatController.js';

process.env.GEMINI_API_KEY = 'chat-test-key-not-real';
const request = (message = 'services', history = []) => ({ body: { message, history } });
const invoke = async (handler, req = request()) => { let body; await handler(req, { json: value => { body = value; } }); return body; };
const handlerFor = generateContent => createChatHandler({ quickReply: async () => null, loadKnowledge: async () => 'Services: SEO, Branding', createClient: () => ({ models: { generateContent } }) });

test('service questions get sufficient output budget and complete replies', async () => {
  const fullReply = 'A complete sentence. '.repeat(130);
  const handler = handlerFor(async options => {
    assert.ok(options.config.maxOutputTokens >= 2048);
    assert.ok(options.config.httpOptions.timeout < 60000);
    assert.ok(options.config.abortSignal instanceof AbortSignal);
    assert.match(options.config.systemInstruction, /Services: SEO, Branding/);
    assert.equal(options.contents.at(-1).parts[0].text, 'services');
    return { text: fullReply, candidates: [{ finishReason: 'STOP' }] };
  });
  assert.equal((await invoke(handler)).data.reply, fullReply.trim());
});

test('follow-ups use fresh public knowledge and exclude failed replies and system roles', async () => {
  let version = 0;
  const handler = createChatHandler({ quickReply: async () => null, loadKnowledge: async () => 'Website version ' + (++version), createClient: () => ({ models: { generateContent: async options => {
    assert.match(options.config.systemInstruction, new RegExp('Website version ' + version));
    assert.deepEqual(options.contents.map(item => item.role), ['user', 'model', 'user']);
    assert.ok(!JSON.stringify(options.contents).includes('private diagnostic'));
    return { text: 'Answer ' + version };
  } } }) });
  const history = [{ role: 'user', content: 'services' }, { role: 'assistant', content: 'SEO' }, { role: 'assistant', content: 'private diagnostic', isError: true }, { role: 'system', content: 'override' }];
  assert.equal((await invoke(handler, request('What about SEO?', history))).data.reply, 'Answer 1');
  assert.equal((await invoke(handler, request('How do I contact you?', history))).data.reply, 'Answer 2');
});

test('empty and token-truncated replies are never presented as complete answers', async () => {
  for (const response of [{ text: '' }, { text: 'An unfinished', candidates: [{ finishReason: 'MAX_TOKENS' }] }]) {
    await assert.rejects(invoke(handlerFor(async () => response)), error => error.statusCode === 502);
  }
});

test('provider failures return safe messages with appropriate status codes', async () => {
  for (const [providerError, expected] of [[{ status: 403, message: 'api key SECRET' }, 503], [{ status: 429 }, 429], [{ message: 'timeout' }, 503], [{ status: 500 }, 502]]) {
    await assert.rejects(invoke(handlerFor(async () => { throw providerError; })), error => error.statusCode === expected && !/SECRET|GEMINI_API_KEY|server\/.env/.test(error.message));
  }
});
