function inlineText(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong> : part);
}

function blocksFrom(text) {
  const blocks = [];
  let paragraph = [], list = null;
  const flushParagraph = () => { if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join(' ') }); paragraph = []; };
  const flushList = () => { if (list) blocks.push(list); list = null; };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { flushParagraph(); continue; }
    const bullet = line.match(/^(?:[-*\u2022]\s+|(\d+)[.)]\s+)(.+)$/);
    if (bullet) {
      flushParagraph();
      const type = bullet[1] ? 'ordered' : 'unordered';
      if (list && list.type !== type) flushList();
      if (!list) list = { type, start: Number(bullet[1]) || 1, items: [] };
      list.items.push(bullet[2]);
    } else if (list && /^\s{2,}\S/.test(raw)) {
      list.items[list.items.length - 1] += ' ' + line;
    } else {
      flushList(); paragraph.push(line);
    }
  }
  flushParagraph(); flushList();
  return blocks;
}

export default function ChatReply({ content }) {
  return blocksFrom(content).map((block, index) => {
    if (block.type === 'paragraph') return <p key={index}>{inlineText(block.text)}</p>;
    const List = block.type === 'ordered' ? 'ol' : 'ul';
    return <List key={index} {...(block.type === 'ordered' ? { start: block.start } : {})}>{block.items.map((item, itemIndex) => {
      const labelled = item.replace(/^\*\*([^*]+):\*\*\s*/, '$1: ').match(/^(.{1,80}?):\s+(.+)$/);
      return <li key={itemIndex}>{labelled
        ? <><strong className="website-chat__service-label">{labelled[1].replace(/\*\*/g, '')}</strong>{inlineText(labelled[2])}</>
        : inlineText(item)}</li>;
    })}</List>;
  });
}
