import Service from '../models/Service.js';
import Project from '../models/Project.js';
import CaseStudy from '../models/CaseStudy.js';
import SiteSettings from '../models/SiteSettings.js';

const text = value => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
const normalize = value => text(value).toLowerCase().replace(/[?!.,]+$/, '').replace(/^please\s+/, '').replace(/\s+please$/, '').trim();
const queries = {
  services: /^(?:services?|your services|what services(?: do you (?:offer|provide))?|(?:show|list)(?: me)?(?: all)?(?: your)? services|what do you (?:do|offer)|which services can help my business)$/, 
  contact: /^(?:contact(?: details| info| information)?|(?:your )?(?:phone(?: number)?|email(?: address)?|whatsapp(?: number)?)|how (?:can|do) i (?:contact|reach)(?: your team| you)?|(?:how (?:can|do) i )?start a project|how (?:can|do) i get started|get started)$/, 
  pricing: /^(?:pricing|prices?|cost|(?:what is|what's) the (?:price|cost)|how much(?: does it cost)?|(?:get |i (?:want|need) )?(?:a )?quote)$/, 
  work: /^(?:work|projects?|portfolio|your (?:work|projects|portfolio)|show me your (?:recent |past )?(?:work|projects)|what projects have you (?:done|completed))$/, 
  results: /^(?:results|case studies|case study|your (?:results|case studies)|show me your (?:results|case studies))$/
};
const loaders = {
  services: () => Service.find({ status: 'published' }).select('title slug shortDescription description deliverables benefits').sort({ displayOrder: 1 }).lean(),
  settings: () => SiteSettings.findOne().select('email phone whatsapp address officeHours').lean(),
  work: () => Project.find({ status: 'published' }).select('name shortDescription').sort({ displayOrder: 1 }).limit(8).lean(),
  results: () => CaseStudy.find({ status: 'published' }).select('title challenge').sort({ displayOrder: 1 }).limit(8).lean()
};
const contactText = settings => {
  const details = [['Email', settings?.email], ['Phone', settings?.phone], ['WhatsApp', settings?.whatsapp], ['Office hours', settings?.officeHours]]
    .filter(([, value]) => text(value)).map(([label, value]) => '- ' + label + ': ' + text(value));
  return ['You can reach our team through the Contact page.', details.join('\n')].filter(Boolean).join('\n\n');
};

// Match only simple, explicit questions. Recommendations and complex follow-ups
// continue to the AI with conversation history. Read fresh, published CMS data.
export async function getQuickReply(message, sources = loaders) {
  const question = normalize(message);
  if (/^(?:hi|hello|hey|good morning|good afternoon|good evening)$/.test(question)) return 'Hi! Ask me about our services, work, results, pricing, or starting a project.';
  if (/^(?:thanks|thank you|thank you very much)$/.test(question)) return 'You are welcome! Let me know if you need anything else.';
  if (queries.contact.test(question)) return contactText(await sources.settings());
  if (queries.pricing.test(question)) return 'For a quote, tell our team which services you need and your project goals.\n\n' + contactText(await sources.settings());
  for (const type of ['work', 'results']) {
    if (!queries[type].test(question)) continue;
    const records = await sources[type]();
    if (!records.length) return type === 'results' ? 'No case studies are currently published. Please contact our team to discuss our work.' : 'No projects are currently published. Please contact our team to discuss our work.';
    const items = records.map(item => '- ' + text(item.name || item.title) + (text(item.shortDescription) ? ': ' + text(item.shortDescription) : ''));
    return (type === 'work' ? 'Here is some of our published work:' : 'Here are our published case studies:') + '\n\n' + items.join('\n') + '\n\n' + (type === 'work' ? 'Visit Our Work for the project details.' : 'Visit Results for the full case studies.');
  }
  const aliases = {
    seo: 'seo', 'search engine optimization': 'seo', 'search engine optimisation': 'seo',
    'google ads': 'google-ads', 'meta ads': 'meta-ads', 'facebook ads': 'meta-ads',
    'social media': 'social-media-marketing', 'social media marketing': 'social-media-marketing',
    branding: 'branding', 'graphic design': 'branding', 'web development': 'web-development',
    'website development': 'web-development', 'video marketing': 'video-marketing',
    'reels marketing': 'video-marketing', 'lead generation': 'lead-generation'
  };
  const topic = question.replace(/^(?:tell me (?:more )?about|what about|explain|what is|what's)\s+/, '');
  const slug = aliases[topic];
  const catalogue = queries.services.test(question);
  if (!catalogue && !slug) return null;
  const services = await sources.services();
  if (catalogue) {
    if (!services.length) return 'No services are currently published. Please contact our team to discuss what you need.';
    return 'Here are our services:\n\n' + services.map(item => '- ' + text(item.title) + (text(item.shortDescription) ? ': ' + text(item.shortDescription) : '')).join('\n') + '\n\nTell me which service interests you or what you want to achieve.';
  }
  const service = services.find(item => item.slug === slug);
  if (!service) return null;
  const summary = text(service.description) || text(service.shortDescription);
  const deliverables = (service.deliverables || []).map(text).filter(Boolean);
  return [text(service.title), summary, deliverables.length ? 'Deliverables:\n' + deliverables.map(item => '- ' + item).join('\n') : '', 'Tell our team about your goals through the Contact page.'].filter(Boolean).join('\n\n');
}
