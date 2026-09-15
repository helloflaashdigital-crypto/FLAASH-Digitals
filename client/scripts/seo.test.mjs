import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { absoluteUrl, buildStructuredData, getContentSeoPage, getSeoPage, indexableSeoPages, seoPages, SITE_URL } from '../src/seo/seoConfig.js';
import { renderRobots, renderSeoHead, renderSitemap } from '../src/seo/seoDocuments.js';

test('all indexable routes have unique metadata and canonical production URLs', () => {
  assert.equal(SITE_URL, 'https://www.flaashdigital.com');
  for (const key of ['path', 'title', 'description']) assert.equal(new Set(indexableSeoPages.map(page => page[key])).size, indexableSeoPages.length, key);
  for (const page of indexableSeoPages) {
    assert.ok(page.title.length > 10 && page.description.length > 30);
    assert.equal(new URL(absoluteUrl(page.path)).origin, SITE_URL);
    assert.ok(!page.path.startsWith('/admin'));
  }
});
test('sitemap exactly matches indexable routes and contains no invented dates', () => {
  const xml = renderSitemap(seoPages);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls, indexableSeoPages.map(page => absoluteUrl(page.path)));
  assert.ok(!xml.includes('vercel.app'));
  assert.ok(!xml.includes('/admin') && !xml.includes('/404') && !xml.includes('/privacy-policy') && !xml.includes('/terms'));
  assert.ok(!renderSitemap([{ ...getSeoPage('/'), lastModified: undefined }]).includes('<lastmod>'));
  assert.ok(!renderSitemap([{ ...getSeoPage('/'), lastModified: '2999-01-01' }]).includes('<lastmod>'));
});
test('robots allows public pages and references only the production sitemap', () => {
  assert.equal(renderRobots(), 'User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: https://www.flaashdigital.com/sitemap.xml\n');
});
test('private, error and unfinished legal pages stay non-indexable', () => {
  for (const path of ['/admin', '/admin/login', '/admin/visitors', '/404', '/not-a-page', '/privacy-policy', '/terms']) assert.equal(getSeoPage(path).noIndex, true, path);
  assert.equal(getSeoPage('/work/the-trading-hustlers').noIndex, false);
});
test('new CMS detail routes are not incorrectly marked noindex before loading', () => {
  for (const path of ['/services/new-service', '/work/new-project', '/results/new-case-study']) assert.equal(getSeoPage(path).noIndex, false);
  const page = getContentSeoPage('case-studies', { slug: 'new-case-study', title: 'Client campaign', challenge: 'A published client challenge.', seoTitle: 'Approved Case Study | FLAASH', seoDescription: 'Approved description of the published case study.' });
  assert.equal(page.title, 'Approved Case Study | FLAASH');
  assert.equal(page.description, 'Approved description of the published case study.');
  assert.equal(page.noIndex, false);
});
test('HTML attributes and JSON-LD safely handle punctuation and markup', () => {
  const page = { ...getSeoPage('/about'), title: 'Client\'s "Growth" & Strategy', description: 'Text </script><script>alert("test")</script>' };
  const html = renderSeoHead(page);
  assert.ok(html.includes('Client&#39;s &quot;Growth&quot; &amp; Strategy'));
  assert.ok(!html.includes('</script><script>'));
  const schema = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => JSON.parse(schema));
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(html.includes('twitter:image:alt'));
});
test('structured data uses real Organization, WebSite, Service and breadcrumb relationships', () => {
  const graph = buildStructuredData(getSeoPage('/services/seo'))['@graph'];
  for (const type of ['Organization', 'WebSite', 'WebPage', 'Service', 'BreadcrumbList']) assert.ok(graph.some(item => item['@type'] === type));
  assert.ok(graph.every(item => !JSON.stringify(item).includes('vercel.app')));
  assert.ok(!JSON.stringify(graph).includes('aggregateRating'));
});
test('Vercel preserves known-route files, private routes, and CMS fallbacks without a homepage catch-all', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.framework, 'vite');
  assert.equal(config.cleanUrls, true);
  assert.ok(config.rewrites.every(rule => rule.destination === '/spa'));
  assert.ok(!config.rewrites.some(rule => rule.source === '/(.*)'));
  assert.ok(config.headers.some(rule => rule.source === '/admin/:path*' && rule.headers.some(header => header.key === 'X-Robots-Tag' && header.value.includes('noindex'))));
});
