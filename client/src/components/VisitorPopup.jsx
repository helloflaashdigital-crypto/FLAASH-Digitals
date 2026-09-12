import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { api } from '../services/api';
import './VisitorPopup.css';

const storageKey = 'flaash_visit';
let session;
let recording;
function getSession() {
  if (session) return session;
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved.sessionId)) session = saved;
  } catch { /* Storage may be unavailable in private browsing. */ }
  if (!session) session = { sessionId: crypto.randomUUID(), landingPage: location.pathname.slice(0, 500), dismissed: false };
  saveSession();
  return session;
}
function saveSession() {
  try { sessionStorage.setItem(storageKey, JSON.stringify(session)); } catch { /* Keep the in-memory session. */ }
}

export default function VisitorPopup() {
  const [visit] = useState(getSession);
  const [open, setOpen] = useState(!visit.dismissed);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const dialog = useRef(null);
  const submitting = useRef(false);
  const close = () => { visit.dismissed = true; saveSession(); setOpen(false); };
  useEffect(() => {
    if (!recording) {
      recording = api.post('/visits', { sessionId: visit.sessionId, landingPage: visit.landingPage })
        .catch(() => { recording = undefined; });
    }
  }, [visit]);
  useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    node.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      node.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  const submit = async event => {
    event.preventDefault();
    if (submitting.current) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const digits = values.phone.replace(/\D/g, '').length;
    if (!values.company.trim() || !/^\+?[\d\s().-]+$/.test(values.phone.trim()) || digits < 7 || digits > 15) {
      setError('Enter your company name and a phone number with 7 to 15 digits.');
      return;
    }
    submitting.current = true;
    setState('sending');
    setError('');
    try {
      await api.post('/visitors', { ...values, sessionId: visit.sessionId, landingPage: visit.landingPage });
      visit.dismissed = true;
      saveSession();
      setState('sent');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not save your details. Please try again.');
      setState('idle');
    } finally { submitting.current = false; }
  };
  if (!open) return null;
  return createPortal(<dialog ref={dialog} className="visitor-popup" aria-labelledby="visitor-title" aria-describedby="visitor-description" onCancel={event => { event.preventDefault(); close(); }}>
    <button type="button" className="visitor-popup__close" aria-label="Close welcome popup" onClick={close}><X size={22}/></button>
    <p className="visitor-popup__eyebrow">WELCOME TO FLAASH</p>
    <h2 id="visitor-title">{state === 'sent' ? 'Thanks for stopping by.' : 'Let?s grow your business.'}</h2>
    <p id="visitor-description">{state === 'sent' ? 'Your details have been received. Our team will be in touch.' : 'Tell us a little about your company so our team can connect with you.'}</p>
    {state === 'sent' ? <div role="status"><button type="button" className="button" onClick={close}>Explore the website</button></div> : <form onSubmit={submit}>
      <div className="visitor-popup__fields">
        <label>Company name<input name="company" autoComplete="organization" maxLength={120} required placeholder="Your company"/></label>
        <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@company.com"/></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} required placeholder="+91 98765 43210"/></label>
      </div>
      <input name="website" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
      <p className="visitor-popup__notice">By submitting, you agree that FLAASH may contact you about your business. We record this visit and any details you submit. <Link to="/privacy-policy" onClick={close}>Privacy policy</Link></p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="visitor-popup__actions"><button type="submit" className="button" disabled={state === 'sending'}>{state === 'sending' ? 'Sending?' : 'Let?s connect'}</button><button type="button" className="visitor-popup__skip" onClick={close}>Continue browsing</button></div>
    </form>}
  </dialog>, document.body);
}
