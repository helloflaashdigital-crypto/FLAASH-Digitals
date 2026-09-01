export const SITE_URL = 'https://flaash-digitals.vercel.app';
export const SITE_NAME = 'FLAASH Digital';
export const SEO_LAST_MODIFIED = '2026-09-01';

const DEFAULT_IMAGE = '/images/featured-case-study-cover.png';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const breadcrumb = (...items) => items.map(([name, path]) => ({ name, path }));

const servicePages = [
  {
    path: '/services/social-media-marketing',
    title: 'Social Media Marketing Services | FLAASH Digital',
    description: 'Build a consistent social presence with strategy, relevant creative and community-focused social media marketing from FLAASH Digital.',
    image: '/images/social-media-marketing-hero.png',
    serviceType: 'Social Media Marketing'
  },
  {
    path: '/services/meta-ads',
    title: 'Meta Ads Management Services | FLAASH Digital',
    description: 'FLAASH Digital plans and manages Meta advertising campaigns focused on reach, qualified enquiries and efficient use of campaign budgets.',
    image: '/images/meta-ads-hero.png',
    serviceType: 'Meta Ads Management'
  },
  {
    path: '/services/google-ads',
    title: 'Google Ads Management Services | FLAASH Digital',
    description: 'Reach people searching with intent through Google Ads strategy, campaign execution, optimisation and clear reporting from FLAASH Digital.',
    image: '/images/google-ads-hero.png',
    serviceType: 'Google Ads Management'
  },
  {
    path: '/services/seo',
    title: 'SEO Services for Sustainable Search Growth | FLAASH',
    description: 'Improve organic visibility with SEO services focused on technical clarity, useful content, search intent and sustainable discoverability.',
    image: '/images/seo-hero.png',
    serviceType: 'Search Engine Optimization'
  },
  {
    path: '/services/branding',
    title: 'Branding and Graphic Design Services | FLAASH Digital',
    description: 'Create a clear, distinctive brand with identity design, graphic design and practical creative systems shaped by FLAASH Digital.',
    image: '/images/branding-hero.png',
    serviceType: 'Branding and Graphic Design'
  },
  {
    path: '/services/web-development',
    title: 'Website Design and Development Services | FLAASH',
    description: 'Build a fast, responsive and conversion-focused website with strategy, user experience, design and development from FLAASH Digital.',
    image: '/images/web-development-hero.png',
    serviceType: 'Website Design and Development'
  },
  {
    path: '/services/video-marketing',
    title: 'Video and Reels Marketing Services | FLAASH Digital',
    description: 'Plan and create short-form video and reels that communicate clearly, earn attention and support your wider digital marketing goals.',
    image: '/images/video-marketing-hero.png',
    serviceType: 'Video and Reels Marketing'
  },
  {
    path: '/services/lead-generation',
    title: 'Lead Generation Services for Business Growth | FLAASH',
    description: 'Build a focused lead generation journey from campaign strategy and creative to qualified enquiries, optimisation and reporting.',
    image: '/images/lead-generation-hero.png',
    serviceType: 'Lead Generation'
  }
].map(page => ({
  ...page,
  kind: 'WebPage',
  breadcrumbs: breadcrumb(['Home', '/'], ['Services', '/services'], [page.serviceType, page.path])
}));

const projectImages = {
  'indian-cricket-academy': '/images/projects/indian-cricket-academy.png',
  eace: '/images/projects/eace.png',
  'tws-the-work-suites': '/images/projects/tws-the-work-suites.png'
};

const projectPages = [
  ['indian-cricket-academy', 'Indian Cricket Academy', 'Lead Generation'],
  ['eace', 'EACE', 'Branding'],
  ['the-trading-hustlers', 'The Trading Hustlers', 'Social Media'],
  ['tws-the-work-suites', 'TWS — The Work Suites', 'Website Development']
].map(([slug, name, category]) => ({
  path: `/work/${slug}`,
  title: `${name} | FLAASH Digital Work`,
  description: `${name} is a published ${category.toLowerCase()} project in the FLAASH Digital portfolio.`,
  image: projectImages[slug] || DEFAULT_IMAGE,
  kind: 'WebPage',
  noIndex: true,
  breadcrumbs: breadcrumb(['Home', '/'], ['Our Work', '/work'], [name, `/work/${slug}`])
}));

export const seoPages = [
  {
    path: '/',
    title: 'Digital Marketing Agency for Business Growth | FLAASH',
    description: 'FLAASH Digital provides SEO, Google Ads, Meta Ads, social media, branding, lead generation, video marketing and website development.',
    image: DEFAULT_IMAGE,
    kind: 'WebPage',
    breadcrumbs: breadcrumb(['Home', '/'])
  },
  {
    path: '/about',
    title: 'About FLAASH Digital | Strategy, Creative and Performance',
    description: 'Learn how FLAASH Digital connects strategy, creative thinking, performance marketing and technology in one focused digital team.',
    image: '/images/team-collaboration-cover.png',
    kind: 'AboutPage',
    breadcrumbs: breadcrumb(['Home', '/'], ['About', '/about'])
  },
  {
    path: '/services',
    title: 'Digital Marketing Services | FLAASH Digital',
    description: 'Explore SEO, Google Ads, Meta Ads, social media, lead generation, branding, video marketing and website development services.',
    image: DEFAULT_IMAGE,
    kind: 'CollectionPage',
    breadcrumbs: breadcrumb(['Home', '/'], ['Services', '/services'])
  },
  ...servicePages,
  {
    path: '/work',
    title: 'Digital Marketing Portfolio and Selected Work | FLAASH',
    description: 'Explore selected digital marketing, branding, social media and website projects from the published FLAASH Digital portfolio.',
    image: '/images/projects/indian-cricket-academy.png',
    kind: 'CollectionPage',
    breadcrumbs: breadcrumb(['Home', '/'], ['Our Work', '/work'])
  },
  ...projectPages,
  {
    path: '/results',
    title: 'Digital Marketing Case Studies | FLAASH Digital',
    description: 'Verified FLAASH Digital case studies and measurable campaign outcomes will be published here after client approval.',
    image: '/images/featured-case-study-cover.png',
    kind: 'CollectionPage',
    noIndex: true,
    breadcrumbs: breadcrumb(['Home', '/'], ['Results', '/results'])
  },
  {
    path: '/contact',
    title: 'Contact FLAASH Digital | Discuss Your Marketing Goals',
    description: 'Contact FLAASH Digital to discuss SEO, paid advertising, social media, branding, lead generation, video or website development.',
    image: DEFAULT_IMAGE,
    kind: 'ContactPage',
    breadcrumbs: breadcrumb(['Home', '/'], ['Contact', '/contact'])
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy | FLAASH Digital',
    description: 'Privacy information for enquiries submitted through the FLAASH Digital website.',
    image: DEFAULT_IMAGE,
    kind: 'WebPage',
    noIndex: true,
    breadcrumbs: breadcrumb(['Home', '/'], ['Privacy Policy', '/privacy-policy'])
  },
  {
    path: '/terms',
    title: 'Terms and Conditions | FLAASH Digital',
    description: 'Terms and conditions for using the FLAASH Digital website.',
    image: DEFAULT_IMAGE,
    kind: 'WebPage',
    noIndex: true,
    breadcrumbs: breadcrumb(['Home', '/'], ['Terms and Conditions', '/terms'])
  }
];

export const indexableSeoPages = seoPages.filter(page => !page.noIndex);
const pagesByPath = new Map(seoPages.map(page => [page.path, page]));

export function normalizePath(pathname = '/') {
  if (pathname === '/') return '/';
  return `/${pathname.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '')}`;
}

export function absoluteUrl(path = '/') {
  return path.startsWith('http') ? path : `${SITE_URL}${path === '/' ? '/' : path}`;
}

export function getSeoPage(pathname) {
  const path = normalizePath(pathname);
  return pagesByPath.get(path) || {
    path,
    title: 'Page Not Found | FLAASH Digital',
    description: 'The requested page could not be found on the FLAASH Digital website.',
    image: DEFAULT_IMAGE,
    kind: 'WebPage',
    noIndex: true,
    breadcrumbs: breadcrumb(['Home', '/'])
  };
}

export function buildStructuredData(page) {
  const url = absoluteUrl(page.path);
  const organization = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/flaash-logo.svg')
    },
    email: 'flaashdigital@gmail.com',
    telephone: '+91 94945 82875',
    sameAs: ['https://www.instagram.com/flaash_digitals/']
  };
  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: 'FLAASH',
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en'
  };
  const webPage = {
    '@type': page.kind || 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'en'
  };
  const graph = [organization, website, webPage];

  if (page.serviceType) {
    const service = {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.serviceType,
      serviceType: page.serviceType,
      description: page.description,
      url,
      provider: { '@id': ORGANIZATION_ID },
      mainEntityOfPage: { '@id': `${url}#webpage` }
    };
    webPage.mainEntity = { '@id': service['@id'] };
    graph.push(service);
  }

  if (page.breadcrumbs?.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: page.breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path)
      }))
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
