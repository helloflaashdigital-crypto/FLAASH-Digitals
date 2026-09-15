import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const snapshot = new URL('src/seo/publishedContent.json', root);
const apiUrl = process.env.SEO_API_URL || 'https://flaash-digitals.onrender.com/api/v1';
const collections = ['services', 'projects', 'case-studies'];
const fields = ['slug', 'title', 'name', 'shortDescription', 'description', 'challenge', 'seoTitle', 'seoDescription', 'updatedAt', 'heroImage', 'thumbnail', 'coverImage'];
if (process.env.SEO_OFFLINE !== '1') {
  const entries = await Promise.all(collections.map(async type => {
    let response;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await fetch(apiUrl.replace(/\/$/, '') + '/' + type + '?limit=100', { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(type + ' returned HTTP ' + response.status);
        break;
      } catch (error) { if (attempt === 1) throw new Error('SEO sync failed: ' + error.message + '. Check the public API, or use SEO_OFFLINE=1 only for an offline build with the saved route snapshot.'); }
    }
    const payload = await response.json();
    if (!Array.isArray(payload.data) || payload.data.length >= 100) throw new Error('Cannot confirm complete sitemap coverage for ' + type + '; check the API pagination before deploying.');
    const records = payload.data.filter(item => item.status === 'published').map(item => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug || '')) throw new Error('Invalid public slug in ' + type);
      return Object.fromEntries(fields.filter(key => item[key] !== undefined).map(key => [key, item[key]]));
    }).sort((a, b) => a.slug.localeCompare(b.slug));
    return [type, records];
  }));
  await mkdir(new URL('src/seo/', root), { recursive: true });
  await writeFile(snapshot, JSON.stringify(Object.fromEntries(entries), null, 2) + '\n', 'utf8');
} else {
  await readFile(snapshot, 'utf8');
  console.warn('SEO_OFFLINE=1: using the saved published route snapshot; new CMS pages require a normal build.');
}
const { seoPages } = await import('../src/seo/seoConfig.js');
const { renderSitemap, renderRobots } = await import('../src/seo/seoDocuments.js');
await writeFile(new URL('public/sitemap.xml', root), renderSitemap(seoPages), 'utf8');
await writeFile(new URL('public/robots.txt', root), renderRobots(), 'utf8');
console.log('SEO ready: ' + seoPages.filter(page => !page.noIndex).length + ' indexable URLs; snapshot ' + fileURLToPath(snapshot));
