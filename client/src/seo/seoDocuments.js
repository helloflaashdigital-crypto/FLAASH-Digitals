import { absoluteUrl, buildStructuredData, SITE_NAME, SITE_URL } from './seoConfig.js';

export const indexRobots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const noIndexRobots = 'noindex, follow';
export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export function renderSeoHead(page) {
  const tag = (attribute, name, content) => '<meta data-rh="true" ' + attribute + '="' + name + '" content="' + escapeHtml(content) + '">';
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image);
  const robots = page.noIndex ? noIndexRobots : indexRobots;
  return [
    '<title data-rh="true">' + escapeHtml(page.title) + '</title>',
    tag('name', 'description', page.description), tag('name', 'robots', robots), tag('name', 'googlebot', robots),
    tag('name', 'author', SITE_NAME),
    '<link data-rh="true" rel="canonical" href="' + escapeHtml(canonical) + '">',
    tag('property', 'og:type', 'website'), tag('property', 'og:locale', 'en_IN'), tag('property', 'og:site_name', SITE_NAME),
    tag('property', 'og:title', page.title), tag('property', 'og:description', page.description), tag('property', 'og:url', canonical),
    tag('property', 'og:image', image), tag('property', 'og:image:alt', page.title + ' - ' + SITE_NAME),
    tag('name', 'twitter:card', 'summary_large_image'), tag('name', 'twitter:title', page.title),
    tag('name', 'twitter:description', page.description), tag('name', 'twitter:image', image),
    tag('name', 'twitter:image:alt', page.title + ' - ' + SITE_NAME),
    '<script data-rh="true" type="application/ld+json">' + JSON.stringify(buildStructuredData(page)).replaceAll('<', '\\u003c') + '</script>'
  ].join('\n');
}
export function renderSitemap(pages) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.filter(page => !page.noIndex).map(page => {
      const modified = page.lastModified && new Date(page.lastModified);
      const lastmod = modified && Number.isFinite(+modified) && +modified <= Date.now()
        ? '\n    <lastmod>' + modified.toISOString() + '</lastmod>' : '';
      return '  <url>\n    <loc>' + escapeHtml(absoluteUrl(page.path)) + '</loc>' + lastmod + '\n  </url>';
    }).join('\n') + '\n</urlset>\n';
}
export const renderRobots = () => 'User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ' + SITE_URL + '/sitemap.xml\n';
