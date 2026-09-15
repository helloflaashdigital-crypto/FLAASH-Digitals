import assert from 'node:assert/strict';
import { test } from 'node:test';
process.env.NODE_ENV = 'test';
const { default: app } = await import('../src/app.js');
test('custom-domain public content and forms can reach the API', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const site of ['https://www.flaashdigital.com', 'https://flaashdigital.com', 'https://flaash-digitals.vercel.app']) {
      const response = await fetch(origin + '/api/v1/health', { headers: { Origin: site } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('access-control-allow-origin'), site);
      assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
    }
    const preflight = await fetch(origin + '/api/v1/visitors', { method: 'OPTIONS', headers: { Origin: 'https://www.flaashdigital.com', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://www.flaashdigital.com');
    const rejected = await fetch(origin + '/api/v1/health', { headers: { Origin: 'https://unrelated.example' } });
    assert.equal(rejected.headers.get('access-control-allow-origin'), null);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
