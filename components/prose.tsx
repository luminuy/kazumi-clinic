import { Fragment, type ReactNode } from 'react';

/**
 * A tiny, safe renderer for the small markdown subset the blog editor accepts. It builds React
 * elements directly rather than emitting an HTML string, so there is no dangerouslySetInnerHTML and
 * no XSS surface — any raw HTML a post contains is rendered as literal text.
 *
 * Block grammar (line-based):
 *   `## text`   → h2          `### text`  → h3
 *   `- text`    → <ul> item (consecutive lines group into one list)
 *   `> text`    → blockquote
 *   blank line  → paragraph break; other consecutive lines join into one <p>
 * Inline grammar: `**bold**` and `[label](https://url)` (http/https only; anything else stays text).
 */

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/)[^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split(INLINE);
  parts.forEach((part, index) => {
    if (!part) return;
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(<strong key={key}>{part.slice(2, -2)}</strong>);
      return;
    }
    const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);
    if (link) {
      nodes.push(
        <a
          key={key}
          href={link[2]}
          target="_blank"
          rel="noopener nofollow"
          className="text-forest underline underline-offset-2 hover:text-forest/80"
        >
          {link[1]}
        </a>,
      );
      return;
    }
    nodes.push(<Fragment key={key}>{part}</Fragment>);
  });
  return nodes;
}

type Block =
  | { type: 'h2' | 'h3' | 'quote' | 'p'; text: string }
  | { type: 'ul'; items: string[] };

function toBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'p', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'ul', items: list });
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith('- ')) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }
    flushList();
    if (line.startsWith('### ')) {
      flushParagraph();
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
    } else if (line.startsWith('## ')) {
      flushParagraph();
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
    } else if (line.startsWith('> ')) {
      flushParagraph();
      blocks.push({ type: 'quote', text: line.slice(2).trim() });
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function Prose({ content, className }: { content: string; className?: string }) {
  const blocks = toBlocks(content);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const key = `b-${i}`;
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={key} className="mt-10 font-serif text-2xl text-olive-deep first:mt-0">
                {renderInline(block.text, key)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={key} className="mt-8 font-serif text-xl text-olive-deep">
                {renderInline(block.text, key)}
              </h3>
            );
          case 'quote':
            return (
              <blockquote
                key={key}
                className="my-6 border-l-2 border-olive/40 pl-4 text-ink/70 italic"
              >
                {renderInline(block.text, key)}
              </blockquote>
            );
          case 'ul':
            return (
              <ul key={key} className="my-4 list-disc space-y-1.5 pl-5 text-ink/75">
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={key} className="mt-4 leading-relaxed text-ink/75 first:mt-0">
                {renderInline(block.text, key)}
              </p>
            );
        }
      })}
    </div>
  );
}
