import ReactMarkdown from "react-markdown";
import { getSafeUrl } from '../api';
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { lazy, Suspense } from 'react';
const CodeBlock = lazy(() => import('./CodeBlock'));

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-semibold text-stone-900 mt-6 mb-3 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-stone-800 mt-5 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-stone-800 mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-stone-700 mt-3 mb-1">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-stone-700 leading-relaxed mb-4 text-base">{children}</p>
  ),
  hr: () => <hr className="border-stone-200 my-8" />,
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-6 mb-4 space-y-1.5 text-stone-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-6 mb-4 space-y-1.5 text-stone-700">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-base text-stone-700">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-stone-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-stone-700">{children}</em>
  ),
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || "");
    const value = String(children).replace(/\n$/, "");

    if (match) {
      return <Suspense fallback={<pre className="overflow-auto"><code>{value}</code></pre>}><CodeBlock language={match[1]} value={value} /></Suspense>;
    }
    return (
      <code className="bg-stone-200/60 text-stone-800 text-sm font-mono px-1.5 py-0.5 rounded border border-stone-300/40">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-amber-600/60 pl-4 my-5 text-stone-600 italic">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-amber-700 underline underline-offset-2 hover:text-amber-600 transition-colors"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img
      src={getSafeUrl(src)}
      alt={alt ?? ""}
      className="rounded-lg w-full my-6 border border-stone-200 object-cover"
      loading="lazy"
    />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-5">
      <table className="w-full text-sm text-left border-collapse text-stone-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-stone-100 text-stone-800">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-stone-100">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 font-semibold text-stone-800">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-stone-600">{children}</td>
  ),
};

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  if (!content) return null;
  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
