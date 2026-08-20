import Service from '../models/Service.js';
import Project from '../models/Project.js';
import CaseStudy from '../models/CaseStudy.js';
import Testimonial from '../models/Testimonial.js';
import Client from '../models/Client.js';
import TeamMember from '../models/TeamMember.js';
import SiteSettings from '../models/SiteSettings.js';
import HomepageContent from '../models/HomepageContent.js';

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const line = (label, value) => value ? `${label}: ${clean(value)}` : '';
const compactList = values => (values || []).map(clean).filter(Boolean).join(', ');

// This is intentionally rebuilt on every question. CMS updates made in the
// admin portal are immediately available to the assistant without model training.
export async function buildWebsiteKnowledge() {
  const published = { status: 'published' };
  const [settings, homepage, services, projects, caseStudies, testimonials, clients, team] = await Promise.all([
    SiteSettings.findOne().lean(), HomepageContent.findOne().lean(),
    Service.find(published).sort({ displayOrder: 1 }).lean(),
    Project.find(published).sort({ displayOrder: 1 }).lean(),
    CaseStudy.find(published).sort({ displayOrder: 1 }).lean(),
    Testimonial.find(published).sort({ displayOrder: 1 }).lean(),
    Client.find().sort({ displayOrder: 1 }).lean(),
    TeamMember.find(published).sort({ displayOrder: 1 }).lean()
  ]);
  const blocks = [
    'FLAASH DIGITAL — CURRENT WEBSITE KNOWLEDGE',
    settings && ['Business details', line('Name', settings.companyName), line('Tagline', settings.tagline), line('About', settings.description), line('Email', settings.email), line('Phone', settings.phone), line('WhatsApp', settings.whatsapp), line('Address', settings.address), line('Office hours', settings.officeHours)].filter(Boolean).join('\n'),
    homepage && ['Homepage', line('Hero message', [homepage.heroHeading, homepage.heroHighlight].filter(Boolean).join(' ')), line('Hero description', homepage.heroDescription), line('About preview', homepage.aboutPreview), line('Call to action', homepage.finalCta), homepage.stats?.length ? `Highlights: ${homepage.stats.map(item => `${clean(item.label)} ${clean(item.value)}`).join('; ')}` : ''].filter(Boolean).join('\n'),
    services.length && `Services\n${services.map(item => [`• ${clean(item.title)}`, line('Summary', item.shortDescription), line('Details', item.description), item.deliverables?.length ? `Deliverables: ${compactList(item.deliverables)}` : '', item.benefits?.length ? `Benefits: ${compactList(item.benefits)}` : ''].filter(Boolean).join(' | ')).join('\n')}`,
    projects.length && `Our work / projects\n${projects.map(item => [`• ${clean(item.name)}`, line('Client', item.client), line('Category', item.category), line('Industry', item.industry), line('Summary', item.shortDescription), line('Result', item.results), item.servicesProvided?.length ? `Services: ${compactList(item.servicesProvided)}` : ''].filter(Boolean).join(' | ')).join('\n')}`,
    caseStudies.length && `Case studies / results\n${caseStudies.map(item => [`• ${clean(item.title)}`, line('Client', item.client), line('Category', item.category), line('Challenge', item.challenge), line('Strategy', item.strategy), line('Results', item.results), item.metrics?.length ? `Metrics: ${item.metrics.map(metric => `${clean(metric.label)} ${clean(metric.value)}`).join(', ')}` : ''].filter(Boolean).join(' | ')).join('\n')}`,
    testimonials.length && `Client testimonials\n${testimonials.map(item => `• ${clean(item.clientName)}${item.company ? `, ${clean(item.company)}` : ''}: ${clean(item.review)}`).join('\n')}`,
    clients.length && `Client brands: ${clients.map(item => clean(item.name)).filter(Boolean).join(', ')}`,
    team.length && `Team\n${team.map(item => `• ${clean(item.name)}${item.designation ? ` — ${clean(item.designation)}` : ''}${item.bio ? `: ${clean(item.bio)}` : ''}`).join('\n')}`
  ].filter(Boolean);
  return blocks.join('\n\n').slice(0, 24000);
}
