import { Menu, X, AtSign, BriefcaseBusiness, CirclePlay, ArrowUp, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Brand } from './Brand';
import { Button, Container } from './UI';
import { api } from '../services/api';
import SiteSearch from './SiteSearch';

const links = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/work', 'Our Work'], ['/results', 'Results'], ['/contact', 'Contact']];
const defaultInstagram = 'https://www.instagram.com/flaash_digitals?igsh=aml0enlkN3RudzFp&igsi=aml0enlkN3RudzFp';

function WhatsAppLogo({ size = 21 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.05 2a9.98 9.98 0 0 0-8.48 15.26L2 22l4.87-1.53A10 10 0 1 0 12.05 2Zm0 18.17a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-2.89.91.94-2.82-.2-.3A8.17 8.17 0 1 1 12.05 20.17Zm4.47-6.13c-.24-.12-1.4-.69-1.62-.76-.22-.08-.38-.12-.54.12-.16.24-.62.76-.76.92-.14.16-.28.18-.52.06a6.56 6.56 0 0 1-1.94-1.2 7.31 7.31 0 0 1-1.35-1.68c-.14-.24-.01-.37.1-.49l.36-.42c.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.79-.2-.47-.4-.41-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.33.98 2.49a9.43 9.43 0 0 0 3.61 3.2c.5.22.9.35 1.2.45.5.16.95.14 1.3.08.4-.06 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z"/></svg>;
}

function InstagramLogo({ size = 20 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r=".75" fill="currentColor" stroke="none"/></svg>;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const update = () => setScrolled(scrollY > 24); addEventListener('scroll', update); return () => removeEventListener('scroll', update); }, []);
  return <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}><Container className="nav__inside"><Link to="/" aria-label="FLAASH Digital home"><Brand wordmark /></Link><nav aria-label="Main navigation">{links.map(([to, label]) => <NavLink key={to} end={to === '/'} to={to}>{label}</NavLink>)}</nav><div className="nav__actions"><button className="nav__search" aria-label="Search website" onClick={() => setSearchOpen(true)}><Search size={19}/></button><Button to="/contact">Get Started</Button></div><button className="nav__toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></button></Container><div className={`mobile-menu ${open ? 'is-open' : ''}`}><div><Link to="/" onClick={() => setOpen(false)}><Brand dark /></Link><button aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div><nav>{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav><button className="mobile-menu__search" onClick={() => { setOpen(false); setSearchOpen(true); }}><Search/> Search the website</button><Button to="/contact" onClick={() => setOpen(false)}>Start Your Project</Button><p>Digital Solutions | Creative Impact</p><a href="mailto:flaashdigital@gmail.com">flaashdigital@gmail.com</a></div><SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} /></header>;
}

export function Footer() {
  const [settings, setSettings] = useState({});
  useEffect(() => { api.get('/settings').then(response => setSettings(response.data.data || {})).catch(() => {}); }, []);
  const whatsapp = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '919494582875';
  const instagram = settings.instagram || defaultInstagram;
  const whatsappUrl = whatsapp ? `https://wa.me/${String(whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent("Hi FLAASH Digital, I'm interested in discussing a digital marketing project.")}` : 'https://wa.me/';
  return <><footer><Container className="footer__grid"><div><Brand dark /><p>{settings.footerText || 'Digital solutions designed to create attention, engagement and measurable growth.'}</p></div><div><h3>Company</h3>{links.slice(0, 5).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</div><div><h3>Services</h3><Link to="/services">Marketing & performance</Link><Link to="/services">Creative & branding</Link><Link to="/services">Digital experiences</Link></div><div><h3>Contact</h3>{settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : <Link to="/contact">Start a project</Link>}{settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}<Link to="/contact">Start a project</Link><p className="footer__note">{settings.address || 'Business contact details will appear here when configured in Site Settings.'}</p><div className="socials"><a aria-label="Instagram" href={instagram} target="_blank" rel="noreferrer"><AtSign/></a><a aria-label="LinkedIn" href={settings.linkedin || '#'}><BriefcaseBusiness/></a><a aria-label="Facebook" href={settings.facebook || '#'}><AtSign/></a><a aria-label="YouTube" href={settings.youtube || '#'}><CirclePlay/></a></div></div></Container><Container className="footer__bottom"><span>© {new Date().getFullYear()} FLAASH Digital. All rights reserved.</span><span><Link to="/admin/login">Admin Portal</Link><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms">Terms & Conditions</Link></span></Container></footer>{instagram && <a className="instagram-float" href={instagram} target="_blank" rel="noreferrer" aria-label="Visit FLAASH Digital on Instagram"><InstagramLogo/><span className="sr-only">Instagram</span></a>}{whatsapp && <a className="whatsapp" href={whatsappUrl} aria-label="Start a WhatsApp conversation"><WhatsAppLogo/><span className="sr-only">WhatsApp</span></a>}<button className="back-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={18}/></button></>;
}
