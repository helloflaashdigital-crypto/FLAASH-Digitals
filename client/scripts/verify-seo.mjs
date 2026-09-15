import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { absoluteUrl, indexableSeoPages, seoPages, SITE_URL } from '../src/seo/seoConfig.js';

const urlIndex = process.argv.indexOf('--url');
const origin = urlIndex >= 0 ? new URL(process.argv[urlIndex + 1]).origin : null;
const dist = new URL('../dist/', import.meta.url);
async function get(path) {
  if (origin) {
    const response = await fetch(origin + path, { signal: AbortSignal.timeout(20000), redirect: 'follow' });
    return { status: response.status, headers: response.headers, text: await response.text(), finalUrl: response.url };
  }
  const file = path === '/' ? 'index.html' : /\.[a-z]+$/.test(path) ? path.slice(1) : path.slice(1) + '.html';
  return { status: 200, headers: new Headers(), text: await readFile(new URL(file, dist), 'utf8') };
}
const meta = (html, name) => html.match(new RegExp('<meta[^>]+(?:name|property)=["\\x27]' + name + '["\\x27][^>]+content=["\\x27]([^"\\x27]*)', 'i'))?.[1];
for (const page of seoPages) {
  const result = await get(page.path);
  assert.equal(result.status, 200, page.path + ' HTTP status');
  const canonical = result.text.match(/rel=["']canonical["'][^>]+href=["']([^"']+)/)?.[1];
  assert.equal(canonical, absoluteUrl(page.path), page.path + ' canonical');
  assert.equal((result.text.match(/rel=["']canonical["']/g) || []).length, 1, page.path + ' duplicate canonical');
  assert.equal((result.text.match(/<title\b/g) || []).length, 1, page.path + ' title count');
  assert.equal(meta(result.text, 'robots').includes('noindex'), Boolean(page.noIndex), page.path + ' robots');
  if (!page.noIndex) assert.ok(!result.headers.get('x-robots-tag')?.includes('noindex'));
  for (const name of ['description', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:image:alt']) assert.ok(meta(result.text, name), page.path + ' missing ' + name);
  const schema = result.text.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(schema);
  assert.equal(JSON.parse(schema)['@context'], 'https://schema.org');
  if (!origin && page.image.startsWith('/')) await access(new URL('../public' + page.image, import.meta.url));
}
const sitemap = await get('/sitemap.xml');
assert.equal(sitemap.status, 200);
assert.ok(sitemap.text.startsWith('<?xml'));
const urls = [...sitemap.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(urls, indexableSeoPages.map(page => absoluteUrl(page.path)));
const robots = await get('/robots.txt');
assert.equal(robots.status, 200);
assert.ok(robots.text.includes('Sitemap: ' + SITE_URL + '/sitemap.xml'));
assert.ok(robots.text.includes('Allow: /'));
assert.ok(!robots.text.includes('Disallow: /\n'));
if (origin) {
  assert.ok(sitemap.headers.get('content-type')?.includes('xml'));
  const missing = await get('/seo-audit-missing-page');
  assert.equal(missing.status, 404, 'Unknown routes must return HTTP 404');
  const admin = await get('/admin/login');
  assert.equal(admin.status, 200);
  assert.ok(admin.headers.get('x-robots-tag')?.includes('noindex'), 'Admin response must be noindex');
} else {
  assert.ok((await get('/404')).text.includes('noindex'));
  const shell = (await get('/spa')).text;
  assert.ok(!shell.includes('rel="canonical"') && !shell.includes('noindex'));
}
console.log('PASS: ' + seoPages.length + ' route documents, ' + urls.length + ' sitemap URLs, metadata, schema, images, robots and exclusions' + (origin ? ' on ' + origin : ' in dist') + '.');
