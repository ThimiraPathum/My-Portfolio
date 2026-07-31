import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

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
