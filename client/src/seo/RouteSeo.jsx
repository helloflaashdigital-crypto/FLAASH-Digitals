import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { absoluteUrl, buildStructuredData, getSeoPage, SITE_NAME } from './seoConfig';

const indexRobots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const noIndexRobots = 'noindex, nofollow, noarchive';

export default function RouteSeo() {
  const { pathname } = useLocation();
  const page = getSeoPage(pathname);
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image);
  const robots = page.noIndex ? noIndexRobots : indexRobots;

  return <Helmet prioritizeSeoTags>
    <html lang='en'/>
    <title>{page.title}</title>
    <meta name='description' content={page.description}/>
    <meta name='robots' content={robots}/>
    <meta name='googlebot' content={robots}/>
    <meta name='author' content={SITE_NAME}/>
    <link rel='canonical' href={canonical}/>
    <meta property='og:type' content='website'/>
    <meta property='og:site_name' content={SITE_NAME}/>
    <meta property='og:title' content={page.title}/>
    <meta property='og:description' content={page.description}/>
    <meta property='og:url' content={canonical}/>
    <meta property='og:image' content={image}/>
    <meta property='og:image:alt' content={`${page.title} — ${SITE_NAME}`}/>
    <meta name='twitter:card' content='summary_large_image'/>
    <meta name='twitter:title' content={page.title}/>
    <meta name='twitter:description' content={page.description}/>
    <meta name='twitter:image' content={image}/>
    <script type='application/ld+json'>{JSON.stringify(buildStructuredData(page))}</script>
  </Helmet>;
}
