import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
export function Button({ children, to, variant = 'primary', type = 'button', ...rest }) { const cls = `button button--${variant}`; return to ? <a className={cls} href={to} {...rest}>{children}<ArrowUpRight size={17}/></a> : <button type={type} className={cls} {...rest}>{children}<ArrowUpRight size={17}/></button>; }
export function Container({ children, className = '' }) { return <div className={`container ${className}`}>{children}</div>; }
export function Eyebrow({ children, dark = false }) { return <p className={`eyebrow ${dark ? 'eyebrow--dark' : ''}`}><i />{children}</p>; }
export function SectionHeading({ eyebrow, title, copy, centered = false, dark = false }) { return <div className={`section-heading ${centered ? 'is-centered' : ''} ${dark ? 'is-dark' : ''}`}><Eyebrow dark={dark}>{eyebrow}</Eyebrow><h2>{title}</h2>{copy && <p>{copy}</p>}</div>; }
export function Reveal({ children, delay = 0, className = '' }) { const reduceMotion=useReducedMotion(); return <motion.div className={className} initial={reduceMotion?false:{ opacity: 0, y: 22, filter:'blur(5px)' }} whileInView={{ opacity: 1, y: 0, filter:'blur(0px)' }} viewport={{ once: true, amount: .12 }} transition={{ duration: .7, delay, ease:[.22,1,.36,1] }}>{children}</motion.div>; }
export function EmptyState({ children }) { return <div className="empty-state">{children}</div>; }
export function ArrowLink({ children, to }) { return <a href={to} className="arrow-link">{children}<ChevronRight size={18}/></a>; }
