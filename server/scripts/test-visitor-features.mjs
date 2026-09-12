import assert from 'node:assert/strict';
import { after, test, mock } from 'node:test';
import { randomUUID } from 'node:crypto';
import { PassThrough } from 'node:stream';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import Visitor from '../src/models/Visitor.js';
import Admin from '../src/models/Admin.js';
import TeamMember from '../src/models/TeamMember.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'visitor-feature-test-secret-only';
process.env.CLOUDINARY_CLOUD_NAME = 'fixture';
const { default: app } = await import('../src/app.js');
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = 'http://127.0.0.1:' + server.address().port + '/api/v1';
after(() => { server.close(); server.closeAllConnections(); mock.restoreAll(); });
const visitors = new Map();
let member;
mock.method(Admin, 'findById', async id => ({ _id: id, isActive: true, role: id }));
mock.method(Visitor, 'updateOne', async (filter, update) => {
  const existing = visitors.get(filter.sessionId);
  const record = existing || { _id: randomUUID(), createdAt: new Date(), ...update.$setOnInsert };
  Object.assign(record, update.$set);
  visitors.set(filter.sessionId, record);
  return { acknowledged: true };
});
const matching = query => [...visitors.values()].filter(value => !query.submittedAt || Boolean(value.submittedAt) === query.submittedAt.$exists);
let lastQuery;
mock.method(Visitor, 'find', query => {
  lastQuery = query;
  let offset = 0;
  return { sort() { return this; }, skip(value) { offset = value; return this; }, limit(value) { return Promise.resolve(matching(query).slice(offset, offset + value)); } };
});
mock.method(Visitor, 'countDocuments', async query => matching(query || {}).length);
mock.method(cloudinary.uploader, 'upload_stream', (options, callback) => {
  assert.equal(options.folder, 'flaash/team');
  const stream = new PassThrough();
  stream.on('finish', () => callback(null, { secure_url: 'https://res.cloudinary.com/demo/image/upload/team.png', public_id: 'flaash/team/photo', format: 'png', width: 1, height: 1 }));
  return stream;
});
mock.method(TeamMember, 'create', async data => { member = new TeamMember(data); await member.validate(); return member; });
mock.method(TeamMember, 'findByIdAndUpdate', async (id, data) => { assert.equal(id, String(member._id)); member.set(data); await member.validate(); return member; });
mock.method(TeamMember, 'find', query => ({ sort() { return this; }, limit() { return this; }, lean: async () => member?.status === query.status ? [member.toObject()] : [] }));
const auth = role => ({ Authorization: 'Bearer ' + jwt.sign({ id: role }, process.env.JWT_SECRET) });
async function request(path, { body, role, method = body ? 'POST' : 'GET' } = {}) {
  const response = await fetch(base + path, {
    method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(role ? auth(role) : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}
const sessionId = randomUUID();
const contact = { sessionId, landingPage: '/about', company: ' Example Co ', email: 'Person@Example.com', phone: '+91 98765 43210' };

test('visitor collection and team photos', async t => {
  await t.test('records an anonymous visit without accepting injected contact data', async () => {
    const result = await request('/visits', { body: { sessionId, landingPage: '/about', company: 'injected', email: 'x@example.com' } });
    assert.equal(result.status, 201);
    assert.equal(visitors.get(sessionId).company, undefined);
    assert.equal(visitors.get(sessionId).landingPage, '/about');
    assert.equal(result.body.data, undefined);
  });
  await t.test('submits normalized contact details onto the same session and ignores extra fields', async () => {
    const result = await request('/visitors', { body: { ...contact, internalNotes: 'injected', createdAt: '2000-01-01' } });
    assert.equal(result.status, 201);
    assert.equal(visitors.size, 1);
    assert.equal(visitors.get(sessionId).company, 'Example Co');
    assert.equal(visitors.get(sessionId).email, 'person@example.com');
    assert.equal(visitors.get(sessionId).internalNotes, undefined);
    assert.ok(visitors.get(sessionId).submittedAt);
    await request('/visits', { body: { sessionId, landingPage: '/work' } });
    assert.equal(visitors.get(sessionId).company, 'Example Co');
    assert.equal(visitors.get(sessionId).landingPage, '/about');
  });
  await t.test('validates company, email, phone, token, and path before writing', async () => {
    for (const invalid of [{ company: ' ' }, { company: {} }, { email: 'wrong' }, { phone: 'abcdefg' }, { phone: '123----' }, { phone: '1234567890123456' }, { sessionId: 'guessable' }, { landingPage: '/?secret=value' }]) {
      const result = await request('/visitors', { body: { ...contact, ...invalid } });
      assert.equal(result.status, 422, JSON.stringify(invalid));
    }
    assert.equal(visitors.size, 1);
  });
  await t.test('can save a form even when the initial visit was not recorded', async () => {
    const result = await request('/visitors', { body: { ...contact, sessionId: randomUUID() } });
    assert.equal(result.status, 201);
    assert.equal(visitors.size, 2);
  });
  await t.test('honeypot submissions do not create records', async () => {
    await request('/visitors', { body: { ...contact, sessionId: randomUUID(), website: 'spam' } });
    assert.equal(visitors.size, 2);
  });
  await t.test('visitor records require admin or superadmin access', async () => {
    assert.equal((await request('/admin/visitors')).status, 401);
    assert.equal((await request('/admin/visitors', { role: 'editor' })).status, 403);
    assert.equal((await request('/admin/visitors', { role: 'admin' })).status, 200);
    assert.equal((await request('/admin/visitors', { role: 'superadmin' })).status, 200);
    assert.equal((await request('/visitors')).status, 404);
    assert.equal(Visitor.schema.path('sessionId').options.select, false);
    assert.equal(Visitor.schema.path('sessionId').options.unique, true);
  });
  await t.test('admin list supports pagination, filters, and non-cacheable responses', async () => {
    await request('/visits', { body: { sessionId: randomUUID(), landingPage: '/' } });
    let result = await request('/admin/visitors?limit=1&page=2', { role: 'admin' });
    assert.equal(result.body.data.items.length, 1);
    assert.equal(result.body.data.total, 3);
    assert.equal(result.body.data.pages, 3);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.ok(result.body.data.items.every(value => !value.sessionId));
    result = await request('/admin/visitors?status=anonymous&page=-2&limit=-1', { role: 'admin' });
    assert.equal(result.body.data.page, 1);
    assert.equal(result.body.data.total, 1);
    assert.deepEqual(lastQuery, { submittedAt: { $exists: false } });
    result = await request('/admin/visitors?status=submitted', { role: 'admin' });
    assert.equal(result.body.data.total, 2);
  });
  await t.test('image uploads require authentication and reject bad types and oversized files', async () => {
    const uploadFile = async (type, size, role) => {
      const form = new FormData();
      form.append('image', new Blob([new Uint8Array(size)], { type }), 'photo');
      form.append('folder', 'team');
      return fetch(base + '/admin/upload', { method: 'POST', headers: role ? auth(role) : {}, body: form });
    };
    assert.equal((await uploadFile('image/png', 1)).status, 401);
    assert.equal((await uploadFile('image/svg+xml', 1, 'admin')).status, 415);
    assert.equal((await uploadFile('image/png', 5 * 1024 * 1024 + 1, 'admin')).status, 413);
  });
  await t.test('uploads a team photo, saves metadata, and publishes it through the team API', async () => {
    const form = new FormData();
    form.append('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jP1sAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'portrait.png');
    form.append('folder', 'team');
    form.append('alt', 'Test Member');
    const upload = await fetch(base + '/admin/upload', { method: 'POST', headers: auth('admin'), body: form });
    assert.equal(upload.status, 201);
    const asset = (await upload.json()).data;
    let result = await request('/admin/team', { role: 'admin', body: { name: 'Test Member', designation: 'Designer', status: 'published', photo: asset } });
    assert.equal(result.status, 201);
    assert.equal(result.body.data.photo.publicId, 'flaash/team/photo');
    result = await request('/team');
    assert.equal(result.body.data[0].photo.url, asset.url);
    await request('/admin/team/' + member._id, { role: 'admin', method: 'PATCH', body: { name: 'Updated Member' } });
    assert.equal(member.photo.url, asset.url);
    await request('/admin/team/' + member._id, { role: 'admin', method: 'PATCH', body: { photo: { url: 'https://example.com/replacement.png' } } });
    assert.equal(member.photo.url, 'https://example.com/replacement.png');
    await request('/admin/team/' + member._id, { role: 'admin', method: 'PATCH', body: { photo: null, status: 'draft' } });
    assert.equal(member.photo, null);
    assert.equal((await request('/team')).body.data.length, 0);
  });
  await t.test('production upload failures do not silently create temporary local images', async () => {
    const previous = process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    process.env.NODE_ENV = 'production';
    try {
      const form = new FormData();
      form.append('image', new Blob(['fixture'], { type: 'image/png' }), 'portrait.png');
      const response = await fetch(base + '/admin/upload', { method: 'POST', headers: auth('admin'), body: form });
      assert.equal(response.status, 503);
    } finally { process.env.NODE_ENV = 'test'; process.env.CLOUDINARY_CLOUD_NAME = previous; }
  });
});
