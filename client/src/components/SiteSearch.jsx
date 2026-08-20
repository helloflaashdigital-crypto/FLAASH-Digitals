import { Search, X, ArrowUpRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/content';

const entries = [
  { title: 'Home', detail: 'FLAASH Digital overview', to: '/' },
  { title: 'About FLAASH', detail: 'Story, mission, values and process', to: '/about' },
  { title: 'Our Work', detail: 'Portfolio projects and partnerships', to: '/work' },
  { title: 'Results & Case Studies', detail: 'Verified strategy and campaign outcomes', to: '/results' },
  { title: 'Contact', detail: 'Start a project conversation', to: '/contact' },
  ...services.map(service => ({ title: service.title, detail: `Service — ${service.shortDescription}`, to: `/services/${service.slug}` }))
];

export default function SiteSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? entries.filter(item => `${item.title} ${item.detail}`.toLowerCase().includes(term)) : entries.slice(0, 6);
  }, [query]);
  useEffect(() => { if (!open) setQuery(''); }, [open]);
  useEffect(() => {
    const close = event => event.key === 'Escape' && onClose();
    addEventListener('keydown', close);
    return () => removeEventListener('keydown', close);
  }, [onClose]);
  if (!open) return null;
  return <div className="site-search" role="dialog" aria-modal="true" aria-label="Search FLAASH Digital">
    <button className="site-search__backdrop" aria-label="Close search" onClick={onClose} />
    <section className="site-search__panel">
      <div className="site-search__input"><Search aria-hidden="true" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search services, work, results…" aria-label="Search the website"/><button onClick={onClose} aria-label="Close search"><X/></button></div>
      <p className="site-search__label">{query ? 'Matching pages' : 'Quick links'}</p>
      <div className="site-search__results">{results.length ? results.map(item => <Link key={item.to} to={item.to} onClick={onClose}><span><b>{item.title}</b><small>{item.detail}</small></span><ArrowUpRight/></Link>) : <p>No matching section found. Try “services”, “work” or “contact”.</p>}</div>
    </section>
  </div>;
}
