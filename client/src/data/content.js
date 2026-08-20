import { BarChart3, Brush, Code2, Megaphone, Search, Video, Target, MousePointerClick } from 'lucide-react';
export const mergeServices = records => {
  const saved = Array.isArray(records) ? records : [];
  return [
    ...services.map(service => saved.find(item => item.slug === service.slug) || service),
    ...saved.filter(item => !services.some(service => service.slug === item.slug))
  ];
};
export const services = [
  ['social-media-marketing', 'Social Media Marketing', 'A social presence that earns attention and builds community.', Megaphone],
  ['meta-ads', 'Meta Ads', 'Campaigns engineered for reach, qualified leads and efficient spend.', Target],
  ['google-ads', 'Google Ads', 'Reach high-intent customers at their moment of decision.', MousePointerClick],
  ['seo', 'SEO', 'Search visibility built on useful content and technical clarity.', Search],
  ['branding', 'Branding & Graphic Design', 'Distinctive identities and everyday creative systems.', Brush],
  ['web-development', 'Website Development', 'High-performing digital experiences built to convert.', Code2],
  ['video-marketing', 'Video & Reels Marketing', 'Short-form stories designed for the feed and the funnel.', Video],
  ['lead-generation', 'Lead Generation', 'An accountable pipeline from first click to qualified inquiry.', BarChart3]
].map(([slug, title, shortDescription, Icon], index) => ({ slug, title, shortDescription, Icon, displayOrder: index + 1 }));
export const clients = ['Indian Cricket Academy', 'EACE', 'The Trading Hustlers', 'TWS — The Work Suites'];
export const projects = clients.map((client, index) => ({ _id: String(index), slug: client.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, ''), name: client, client, category: ['Lead Generation', 'Branding', 'Social Media', 'Web Development'][index], shortDescription: 'A focused digital engagement shaped around real business objectives.', servicesProvided: ['Strategy', 'Creative', 'Performance'], image: null }));
export const mergeProjects = records => { const saved=Array.isArray(records)?records:[]; return [...projects.map(project=>saved.find(item=>item.slug===project.slug)||project),...saved.filter(item=>!projects.some(project=>project.slug===item.slug))]; };
const suppliedProjectAssets = {
  'indian-cricket-academy': { image: '/images/projects/indian-cricket-academy.png', websiteUrl: 'https://icacricket.in/' },
  eace: { image: '/images/projects/eace.png', websiteUrl: 'https://eacecricket.com/' },
  'tws-the-work-suites': { image: '/images/projects/tws-the-work-suites.png' }
};
export const getProjectArtwork = project => suppliedProjectAssets[project?.slug]?.image || project?.thumbnail?.url || project?.image;
export const getProjectWebsite = project => project?.websiteUrl || project?.url || suppliedProjectAssets[project?.slug]?.websiteUrl || '';
// Uploaded logos can have a very large empty white border. Trim only that
// outer whitespace while delivering the image; the original Cloudinary asset
// remains unchanged.
export const trimProjectImage = url => url?.includes('/image/upload/')
  ? url.replace('/image/upload/', '/image/upload/e_trim:3/')
  : url;
export const process = [['01', 'Discover', 'Understand the business, goals, audience and competitive space.'], ['02', 'Strategize', 'Build a custom growth strategy around the right opportunities.'], ['03', 'Create', 'Produce campaigns, content, brand assets and digital experiences.'], ['04', 'Launch', 'Activate across the selected channels with care and pace.'], ['05', 'Optimize', 'Measure the signal and continuously make it stronger.'], ['06', 'Scale', 'Invest further in the work that is producing the best return.']];
export const reasons = [['Strategy first', 'Every engagement starts with a clear growth objective.'], ['Creative that converts', 'Design is made to earn attention and direct it into action.'], ['Performance focused', 'Decisions are grounded in meaningful measurement.'], ['Transparent partnership', 'You always know what is happening, and why.'], ['End-to-end execution', 'Strategy, ads, design, development and optimisation together.'], ['Built to grow', 'The work is structured to adapt as your business does.']];
