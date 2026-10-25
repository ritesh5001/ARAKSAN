import { Fragment, type ReactNode } from "react";

/** Renders *text* as italics. The only inline formatting the editor supports. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * Like <Inline>, but wraps each word in a mask so it can rise into view.
 * Put it inside an element with the `words` class (revealed on scroll) or
 * `words words-load` (animated on page load). Only ordinary spaces split
 * words, so French non-breaking spaces keep "tout :" together.
 */
export function Words({ text }: { text: string }) {
  let index = 0;
  const word = (w: string, key: number) =>
    /^\s*$/.test(w) ? (
      w
    ) : (
      <span key={key} className="w">
        <span style={{ "--i": index++ } as React.CSSProperties}>{w}</span>
      </span>
    );

  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, p) => {
        const italic = part.startsWith("*") && part.endsWith("*") && part.length > 2;
        const nodes = (italic ? part.slice(1, -1) : part).split(/([ \n\t]+)/).map(word);
        return italic ? (
          <em key={p} className="italic">
            {nodes}
          </em>
        ) : (
          <Fragment key={p}>{nodes}</Fragment>
        );
      })}
    </>
  );
}

/** Strips formatting markers for plain-text contexts (metadata, alt text). */
export function plain(text: string): string {
  return text.replace(/\*([^*]+)\*/g, "$1");
}

type ProseProps = {
  text: string;
  /** How a paragraph starting with "> " is shown. */
  marked?: "pivot" | "heading";
  className?: string;
  reveal?: boolean;
};

/**
 * Splits editor text into paragraphs on blank lines. A paragraph that starts
 * with "> " is set apart: as a serif pivot line in essays and About, or as a
 * section heading in the privacy notice.
 */
export function Prose({ text, marked = "pivot", className = "", reveal = false }: ProseProps) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const r = reveal ? "reveal " : "";
  const nodes: ReactNode[] = blocks.map((block, i) => {
    if (block.startsWith("> ")) {
      const content = <Inline text={block.slice(2)} />;
      return marked === "heading" ? (
        <h2 key={i} className={`${r}font-display text-title mt-14 mb-4 first:mt-0`}>
          {content}
        </h2>
      ) : (
        <p key={i} className={`${r}font-display text-standfirst my-12 border-l border-bronze pl-6 italic md:-ml-6`}>
          {content}
        </p>
      );
    }
    return (
      <p key={i} className={`${r}my-6 first:mt-0 last:mb-0`}>
        <Inline text={block} />
      </p>
    );
  });

  return <div className={className}>{nodes}</div>;
}
