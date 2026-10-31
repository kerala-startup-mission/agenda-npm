import { useEffect, useRef, useState } from 'react';
import AgendaEmbed, { SpeakersEmbed, loadAgendaData, generateAgendaPdf } from '@kerala-startup-mission/agenda';

const AGENDA_EVENT = 'huddle-global-2024';
const AGENDA_URL = 'https://events.startupmission.in';

function AgendaCard() {
  const mountRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mountRef.current) {
      AgendaEmbed.init(mountRef.current);
    }
  }, []);

  async function downloadPdf() {
    setBusy(true);
    setError('');
    try {
      const data = await loadAgendaData({ url: AGENDA_URL, event: AGENDA_EVENT });
      await generateAgendaPdf({
        eventName: 'Huddle Global 2024',
        slug: AGENDA_EVENT,
        venueData: { agenda: data.agenda },
        action: 'download'
      });
    } catch (err) {
      console.error(err);
      setError('Could not generate the PDF.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center justify-end gap-3">
        {error && <span className="text-xs text-red-600">{error}</span>}
        <button
          type="button"
          onClick={downloadPdf}
          disabled={busy}
          className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
        >
          {busy ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>
      <div
        ref={mountRef}
        data-agenda={AGENDA_EVENT}
        data-url={AGENDA_URL}
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

function SpeakersCard() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (mountRef.current) {
      SpeakersEmbed.init(mountRef.current);
    }
  }, []);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
      <div
        ref={mountRef}
        data-speakers="huddle-global-2024"
        data-url="https://events.startupmission.in"
        data-categories="speaker,government"
        data-border="border-slate-300"
        data-bg="bg-white"
        data-text="text-slate-900"
        data-round="border-slate-900"
        data-color-1="text-slate-500"
        data-color-2="text-slate-600"
        data-columns="4"
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
            Huddle Global 2024 widgets embedded inside a React app
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            This example installs the npm package and initializes both the agenda widget and the
            speakers widget inside dedicated React mount containers.
          </p>
        </div>

        <div className="space-y-8">
          <AgendaCard />
          <SpeakersCard />
        </div>
      </div>
    </main>
  );
}
