import { useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('docker', docker);
SyntaxHighlighter.registerLanguage('markdown', markdown);

const theme = {
  ...oneLight,
  comment: { ...oneLight["comment"], color: "#6b7280", fontStyle: "italic" },
  prolog: { ...oneLight["prolog"], color: "#6b7280" },
};

interface CodeBlockProps {
  language: string;
  value: string;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group my-5 rounded-lg overflow-hidden border border-black/[0.12] shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-black/[0.04] border-b border-black/[0.08]">
        <span className="text-xs font-mono text-black/50 uppercase tracking-wide">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-black/50 hover:text-black/80 transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={theme}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#fffefc",
          fontSize: "0.875rem",
          lineHeight: 1.6,
        }}
        codeTagProps={{
          style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
