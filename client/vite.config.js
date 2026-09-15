import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getSeoPage, seoPages } from './src/seo/seoConfig.js';
import { renderSeoHead } from './src/seo/seoDocuments.js';

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
        .replace(/<meta\s+(?:data-rh=['"]true['"]\s+)?name=['"]description['"][^>]*>/i, '')
        .replace(/<meta\s+name=['"]seo-placeholder['"][^>]*>/i, '');
      // A neutral shell lets newly published CMS routes load before deciding
      // whether they exist; it must not inherit the homepage canonical or noindex.
      await writeFile(resolve(outputDirectory, 'spa.html'), cleanTemplate.replace('</head>', '<title data-rh="true">FLAASH Digital</title></head>'), 'utf8');
      const pages = [...seoPages, getSeoPage('/404')];
      await Promise.all(pages.map(async page => {
        const html = cleanTemplate.replace('</head>', renderSeoHead(page) + '</head>');
        const outputPath = page.path === '/' ? indexPath : resolve(outputDirectory, page.path.slice(1) + '.html');
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, html, 'utf8');
      }));
    }
  };
}
export default defineConfig({ plugins: [react(), staticRouteSeo()] });
