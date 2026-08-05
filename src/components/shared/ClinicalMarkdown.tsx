import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

/**
 * Renders a stored clinical report body as formatted text.
 *
 * The report `content` column is Markdown — the intake prompt mandates
 * `### 1. Chief Complaint` style section headers — but the portal was printing
 * it into a `<p>` with `whitespace-pre-wrap`, so clinicians and patients read
 * the raw `###` and `-` characters. This component changes nothing about the
 * text; it only stops showing the syntax.
 *
 * Three deliberate choices:
 *
 * `remark-breaks` — reports do not all come from the model. A doctor-issued
 * report is composed server-side as plain lines separated by single newlines
 * ("Chief Complaint: …\nWorking Diagnosis: …"). Standard Markdown folds those
 * into one paragraph, which would have been a regression for every clinician
 * report. With breaks on, a line the author put on its own line stays there.
 *
 * No `rehype-raw` — the body is model-generated text rendered inside an
 * authenticated clinical portal. `react-markdown` escapes embedded HTML unless
 * that plugin is added, and it must not be added here: a report is not a
 * trusted document just because it is ours.
 *
 * Explicit `components` rather than the typography plugin — `@tailwindcss/
 * typography` ships its own type scale, colours and spacing, which is a
 * different design language from this app's. Every element below is mapped to
 * tokens already in use elsewhere in the portal.
 */

/** Tailwind's `space-y` cannot reach these — Markdown output is a flat list. */
const HEADING = "font-headline font-bold text-foreground first:mt-0";

const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => (
    <h1 className={`${HEADING} mt-6 mb-3 border-b border-border-subtle pb-2 text-lg`}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className={`${HEADING} mt-6 mb-3 border-b border-border-subtle pb-2 text-base`}>
      {children}
    </h2>
  ),
  // The level the report template actually uses for its numbered sections.
  h3: ({ children }) => (
    <h3 className={`${HEADING} mt-5 mb-2 text-sm`}>{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className={`${HEADING} mt-4 mb-1.5 text-sm font-semibold`}>{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className={`${HEADING} mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wider`}>
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className={`${HEADING} mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground`}>
      {children}
    </h6>
  ),

  p: ({ children }) => (
    <p className="my-2 text-sm leading-relaxed text-foreground">{children}</p>
  ),

  // `my-2` rather than `mb-*`: these margins also have to work for a list
  // nested inside a list item, where a bottom-only margin collapses wrongly.
  ul: ({ children }) => (
    <ul className="my-2 ml-5 list-disc space-y-1 text-sm text-foreground marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-5 list-decimal space-y-1 text-sm text-foreground marker:font-semibold marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,

  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,

  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-r-lg border-l-2 border-primary/40 bg-surface-container-low py-2 pl-4 pr-3 text-sm italic text-muted-foreground">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="my-5 border-border-subtle" />,

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),

  // `code` covers both the inline span and the body of a fenced block; only the
  // inline one carries a chip background.
  code: ({ className, children }) => {
    const isBlock = Boolean(className?.startsWith("language-"));
    if (isBlock) {
      return <code className="font-mono text-xs text-foreground">{children}</code>;
    }
    return (
      <code className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-xl border border-border-subtle bg-surface-container-low p-3">
      {children}
    </pre>
  ),

  // A wide table scrolls inside its own box; the modal itself must not gain a
  // horizontal scrollbar.
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-container-low">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-border-subtle px-3 py-2 text-left text-xs font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border-subtle px-3 py-2 align-top text-foreground">
      {children}
    </td>
  ),
};

const PLUGINS = [remarkGfm, remarkBreaks];

interface ClinicalMarkdownProps {
  /** The report body exactly as stored. Never transformed. */
  content?: string | null;
  /** Extra classes for the wrapper — layout only. */
  className?: string;
  /** Shown when the report has no body. */
  fallback?: string;
}

export const ClinicalMarkdown: React.FC<ClinicalMarkdownProps> = ({
  content,
  className = "",
  fallback = "No report content recorded.",
}) => {
  if (!content?.trim()) {
    return <p className="text-sm text-muted-foreground">{fallback}</p>;
  }

  return (
    // `break-words` so an unbroken token — a long identifier or URL in the
    // model's output — cannot push the modal wider than its container.
    <div className={`text-sm text-foreground break-words ${className}`}>
      <ReactMarkdown remarkPlugins={PLUGINS} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ClinicalMarkdown;
