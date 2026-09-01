import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {
  absoluteUrl,
  buildStructuredData,
  seoPages,
  SITE_NAME
} from './src/seo/seoConfig.js';

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function renderSeoHead(page) {
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image);
  const robots = page.noIndex
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const schema = JSON.stringify(buildStructuredData(page)).replaceAll('<', '\\u003c');

  return [
    `<title data-rh='true'>${escapeHtml(page.title)}</title>`,
    `<meta data-rh='true' name='description' content='${escapeHtml(page.description)}'>`,
    `<meta data-rh='true' name='robots' content='${robots}'>`,
    `<meta data-rh='true' name='googlebot' content='${robots}'>`,
    `<meta data-rh='true' name='author' content='${SITE_NAME}'>`,
    `<link data-rh='true' rel='canonical' href='${canonical}'>`,
    `<meta data-rh='true' property='og:type' content='website'>`,
    `<meta data-rh='true' property='og:site_name' content='${SITE_NAME}'>`,
    `<meta data-rh='true' property='og:title' content='${escapeHtml(page.title)}'>`,
    `<meta data-rh='true' property='og:description' content='${escapeHtml(page.description)}'>`,
    `<meta data-rh='true' property='og:url' content='${canonical}'>`,
    `<meta data-rh='true' property='og:image' content='${image}'>`,
    `<meta data-rh='true' property='og:image:alt' content='${escapeHtml(`${page.title} — ${SITE_NAME}`)}'>`,
    `<meta data-rh='true' name='twitter:card' content='summary_large_image'>`,
    `<meta data-rh='true' name='twitter:title' content='${escapeHtml(page.title)}'>`,
    `<meta data-rh='true' name='twitter:description' content='${escapeHtml(page.description)}'>`,
    `<meta data-rh='true' name='twitter:image' content='${image}'>`,
    `<script data-rh='true' type='application/ld+json'>${schema}</script>`
  ].join('');
}

function staticRouteSeo() {
  return {
    name: 'flaash-static-route-seo',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const outputDirectory = resolve('dist');
      const indexPath = resolve(outputDirectory, 'index.html');
      const builtIndex = await readFile(indexPath, 'utf8');
      const cleanTemplate = builtIndex
        .replace(/<title[^>]*>[\s\S]*?<\/title>/i, '')
        .replace(/<meta\s+name=['"]description['"][^>]*>/i, '')
        .replace(/<meta\s+name=['"]seo-placeholder['"][^>]*>/i, '');

      await Promise.all(seoPages.map(async page => {
        const html = cleanTemplate.replace('</head>', `${renderSeoHead(page)}</head>`);
        const outputPath = page.path === '/'
          ? indexPath
          : resolve(outputDirectory, `${page.path.slice(1)}.html`);
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, html, 'utf8');
      }));
    }
  };
}

export default defineConfig({
  plugins: [react(), staticRouteSeo()]
});
