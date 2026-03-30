import { useEffect, useRef } from 'react';

function loadAgendaScript() {
  const existing = document.querySelector('script[data-agenda-embed-script="true"]');

  if (existing) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/agenda-embed.js';
    script.async = true;
    script.dataset.agendaEmbedScript = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load agenda-embed.js'));
    document.body.appendChild(script);
  });
}

function AgendaCard() {
  const mountRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadAgendaScript()
      .then(() => {
        if (!cancelled && mountRef.current && window.AgendaEmbed) {
          window.AgendaEmbed.init(mountRef.current);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
      <div
        ref={mountRef}
        data-agenda="huddle-global-2024"
        data-url="https://events.startupmission.in"
        data-border="border-slate-300"
        data-bg="bg-white"
        data-select="bg-slate-900 text-white border-slate-900"
        data-text="text-slate-900"
        data-round="border-slate-900"
        data-color-1="text-slate-500"
        data-color-2="text-slate-600"
      />
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Vite React Tailwind Example
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Huddle Global 2024 agenda embedded inside a React app
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            This example uses a dedicated mount container, loads the generated agenda bundle once,
            and asks the widget to initialize itself inside the React component.
          </p>
        </div>

        <AgendaCard />
      </div>
    </main>
  );
}
