import { useEffect, useState } from 'react';

const CODE_SNIPPETS = [
  "const App = () => {",
  "  return <Dashboard />;",
  "}",
  "import React, { useState } from 'react';",
  "function optimize(arr) {",
  "  return arr.sort();",
  "}",
  "export default function Hero() {",
  "async function fetchData() {",
  "  const res = await api.get('/data');",
  "  return res.data;",
  "}",
  "git commit -m 'initial code'",
  "npm install tailwindcss",
  "<div className='flex items-center gap-2'>",
  "console.log('Building...');",
  "const [state, setState] = useState(null);",
  "useEffect(() => { loadData(); }, []);",
  "import { motion } from 'framer-motion';",
  "export const api = axios.create({ baseURL });",
  "interface Project { id: number; title: string; }",
  "php artisan migrate",
  "Route::apiResource('/projects', ProjectController::class);",
  "$project->update($request->all());",
  "SELECT * FROM projects WHERE featured = 1;",
  "npm run dev",
  "<NavLink to='/projects'>Projects</NavLink>",
  "const filtered = projects.filter(p => p.category === cat);",
  "border border-cyan-400/20 rounded-xl",
  "bg-gradient-to-r from-cyan-400 to-blue-500",
  "transition-all duration-300 ease-in-out",
  "z-index: 50; position: fixed;",
  "git push origin main",
  "docker-compose up -d",
];

export default function CodeBackground() {
  const [elements, setElements] = useState<
    { id: number; text: string; top: string; left: string; delay: string; duration: string; drift: string }[]
  >([]);

  useEffect(() => {
    const list = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      text: CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)],
      top: `${Math.random() * 105}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${12 + Math.random() * 18}s`,
      drift: `${(Math.random() - 0.5) * 40}px`,
    }));
    setElements(list);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-transparent">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute whitespace-nowrap mono text-[10px] sm:text-xs text-[#22d3ee] code-bg-el font-medium"
          style={{
            top: el.top,
            left: el.left,
            animationDelay: el.delay,
            animationDuration: el.duration,
            '--drift': el.drift,
          } as React.CSSProperties}
        >
          {el.text}
        </div>
      ))}
      <style>{`
        .code-bg-el {
          opacity: 0;
          animation: code-float linear infinite;
        }
        @keyframes code-float {
          0% {
            opacity: 0;
            transform: translateY(30px) translateX(0px);
          }
          8% {
            opacity: 0.10;
          }
          92% {
            opacity: 0.10;
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) translateX(var(--drift, 0px));
          }
        }
        .code-bg-el {
          color: #475569 !important; /* Update background code color to paragraph text */
        }
      `}</style>
    </div>
  );
}
