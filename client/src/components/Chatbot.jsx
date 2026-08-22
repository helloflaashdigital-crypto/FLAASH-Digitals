import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, BotMessageSquare, LoaderCircle, Send, Sparkles, X } from 'lucide-react';
import { api } from '../services/api';

const greeting = { role: 'assistant', content: 'Hi — I’m the FLAASH assistant. Ask me about our services, work, results, or starting a project.' };
const suggestions = ['Which services can help my business?', 'Show me your recent work', 'How can I start a project?'];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([greeting]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => { if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, open, sending]);
  const send = async value => {
    const message = value.trim();
    if (!message || sending) return;
    const history = messages.slice(-6);
    setMessages(current => [...current, { role: 'user', content: message }]);
    setDraft(''); setSending(true);
    try {
      const response = await api.post('/chat', { message, history });
      setMessages(current => [...current, { role: 'assistant', content: response.data.data.reply }]);
    } catch (error) {
      setMessages(current => [...current, { role: 'assistant', isError: true, content: error.response?.data?.message || 'I’m having trouble connecting right now. Please try again shortly.' }]);
    } finally { setSending(false); }
  };
  return <div className={`website-chat${open ? ' is-open' : ''}`}>
    <AnimatePresence>{open && <motion.section className="website-chat__panel" aria-label="FLAASH website assistant" role="dialog" aria-modal="false" initial={reduceMotion ? false : { opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .98 }} transition={{ duration: .28, ease: [.22, 1, .36, 1] }}>
      <header><span className="website-chat__avatar"><Bot size={19}/></span><div><strong>Ask FLAASH</strong><small><i/>Website assistant</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close assistant"><X size={19}/></button></header>
      <div className="website-chat__messages" ref={scrollRef} aria-live="polite">{messages.map((item, index) => <div className={`website-chat__message website-chat__message--${item.role}${item.isError ? ' is-error' : ''}`} key={`${item.role}-${index}`}><span>{item.role === 'assistant' ? <Bot size={15}/> : 'You'}</span><p>{item.content}</p></div>)}{sending && <div className="website-chat__typing" aria-label="Assistant is typing"><i/><i/><i/></div>}</div>
      {messages.length === 1 && <div className="website-chat__suggestions">{suggestions.map(item => <button type="button" key={item} onClick={() => send(item)}>{item}</button>)}</div>}
      <form onSubmit={event => { event.preventDefault(); send(draft); }}><label className="sr-only" htmlFor="flaash-chat-message">Ask a question</label><textarea id="flaash-chat-message" rows="1" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(draft); } }} placeholder="Ask about FLAASH…" maxLength="1200" disabled={sending}/><button type="submit" disabled={!draft.trim() || sending} aria-label="Send message">{sending ? <LoaderCircle size={18}/> : <Send size={18}/>}</button></form>
      <p className="website-chat__note"><Sparkles size={12}/> Answers use current FLAASH website content.</p>
    </motion.section>}</AnimatePresence>
    <button type="button" className="website-chat__toggle" onClick={() => setOpen(value => !value)} aria-label={open ? 'Close FLAASH assistant' : 'Open FLAASH assistant'} aria-expanded={open}>{open ? <X size={23}/> : <BotMessageSquare size={22}/>}<span className="sr-only">Ask FLAASH</span></button>
  </div>;
}
