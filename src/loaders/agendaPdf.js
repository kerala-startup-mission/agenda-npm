// Client-side agenda PDF generator, ported from the event-manager repo.
// pdfMake (+ vfs_fonts) and marked are heavy, so they are lazy-loaded from a
// CDN on first use instead of bundled into the embed.

const CDN = {
  pdfmake: 'https://cdn.jsdelivr.net/npm/pdfmake@0.2.12/build/pdfmake.min.js',
  vfs: 'https://cdn.jsdelivr.net/npm/pdfmake@0.2.12/build/vfs_fonts.js',
  marked: 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js'
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-agenda-pdf="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.agendaPdf = src;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
}

let libsPromise;
function ensurePdfLibs() {
  if (!libsPromise) {
    // pdfmake first, then vfs_fonts (it attaches to window.pdfMake); marked in parallel.
    libsPromise = Promise.all([
      loadScript(CDN.pdfmake).then(() => loadScript(CDN.vfs)),
      loadScript(CDN.marked)
    ]).catch((error) => {
      libsPromise = undefined; // allow a retry on the next click
      throw error;
    });
  }
  return libsPromise;
}

async function resolveLogo(logo) {
  if (!logo) return '';
  const raw = String(logo).trim();
  if (/^https?:/i.test(raw)) {
    const response = await fetch(raw);
    if (!response.ok) return '';
    const text = await response.text();
    return text.slice(Math.max(0, text.indexOf('<svg')));
  }
  return raw.slice(Math.max(0, raw.indexOf('<svg')));
}

// Printable content width for A4 portrait minus the 40pt side margins.
const CONTENT_WIDTH = 515;
const TIME_COL_WIDTH = 96;

function parseDate(value) {
  if (!value) return null;
  // API datetimes are "YYYY-MM-DD HH:MM:SS"; normalise so Safari parses them.
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value) {
  const date = parseDate(value);
  if (!date) return '';
  // "9:30 AM" → "9:30am" to match the reference layout.
  return date
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' ', '')
    .toLowerCase();
}

function formatTimeRange(item) {
  const start = formatTime(item.start_time);
  const end = formatTime(item.end_time);
  return end ? `${start} – ${end}` : start;
}

// Rich-text runs for the date heading: bold weekday, regular ", Month D".
function dateHeadingRuns(dateLabel, sampleSession) {
  const date = parseDate(sampleSession?.start_time) ?? new Date(dateLabel);
  if (Number.isNaN(date.getTime())) {
    return [{ text: dateLabel, bold: true }];
  }
  const weekday = date.toLocaleDateString([], { weekday: 'long' });
  const rest = date.toLocaleDateString([], { month: 'long', day: 'numeric' });
  return [
    { text: weekday, bold: true },
    { text: `, ${rest}` }
  ];
}

// --- Markdown → pdfmake -----------------------------------------------------
// Convert marked's inline tokens into styled pdfmake text runs.
function inlineRuns(tokens, base = {}) {
  const runs = [];

  for (const token of tokens || []) {
    switch (token.type) {
      case 'strong':
        runs.push(...inlineRuns(token.tokens, { ...base, bold: true }));
        break;
      case 'em':
        runs.push(...inlineRuns(token.tokens, { ...base, italics: true }));
        break;
      case 'del':
        runs.push(...inlineRuns(token.tokens, { ...base, decoration: 'lineThrough' }));
        break;
      case 'codespan':
        runs.push({ text: token.text, ...base });
        break;
      case 'link': {
        const inner = inlineRuns(token.tokens, { ...base, color: '#2563eb', decoration: 'underline' });
        inner.forEach((run) => { run.link = token.href; });
        runs.push(...inner);
        break;
      }
      case 'br':
        runs.push({ text: '\n', ...base });
        break;
      default:
        if (token.tokens && token.tokens.length) {
          runs.push(...inlineRuns(token.tokens, base));
        } else {
          runs.push({ text: token.text ?? token.raw ?? '', ...base });
        }
    }
  }

  return runs;
}

// Convert marked's block tokens into pdfmake content nodes.
function blockNodes(tokens) {
  const nodes = [];

  for (const token of tokens || []) {
    switch (token.type) {
      case 'paragraph':
        nodes.push({ text: inlineRuns(token.tokens), margin: [0, 0, 0, 2] });
        break;
      case 'heading':
        nodes.push({ text: inlineRuns(token.tokens), bold: true, margin: [0, 2, 0, 1] });
        break;
      case 'list': {
        const items = (token.items || []).map((item) => ({ text: inlineRuns(item.tokens?.[0]?.tokens ?? item.tokens) }));
        // Match the speaker list's left indent.
        nodes.push(token.ordered ? { ol: items, margin: [5, 0, 0, 0] } : { ul: items, margin: [5, 0, 0, 0] });
        break;
      }
      case 'blockquote':
        nodes.push(...blockNodes(token.tokens));
        break;
      case 'code':
        nodes.push({ text: token.text, margin: [0, 2, 0, 2] });
        break;
      case 'space':
        break;
      default:
        if (token.tokens && token.tokens.length) {
          nodes.push({ text: inlineRuns(token.tokens) });
        } else if (token.text) {
          nodes.push({ text: token.text });
        }
    }
  }

  return nodes;
}

function markdownToPdfmake(markdown) {
  try {
    const nodes = blockNodes(window.marked.lexer(String(markdown), { breaks: true }));
    return nodes.length ? nodes : [{ text: String(markdown) }];
  } catch (error) {
    return [{ text: String(markdown) }];
  }
}

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function speakerLabel(speaker) {
  return [speaker.name, speaker.designation, speaker.organisation].filter(Boolean).join(', ');
}

// Per category: a bold heading followed by one line per speaker
// ("name, designation, organisation"). Returns pdfmake stack nodes.
function speakerStack(speakers) {
  const groups = speakers && typeof speakers === 'object' ? Object.entries(speakers) : [];
  const nodes = [];

  groups.forEach(([category, list]) => {
    if (!Array.isArray(list) || list.length === 0) return;

    nodes.push({ text: capitalize(category), bold: true, fontSize: 9, margin: [0, 4, 0, 1] });

    const items = list
      .filter(Boolean)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(speakerLabel);

    nodes.push({ ul: items, fontSize: 9, margin: [5, 0, 0, 0] });
  });

  return nodes;
}

function sessionCell(item) {
  const stack = [];

  if (item.category) {
    stack.push({ text: item.category, italics: true });
  }

  stack.push({ text: item.name || '', bold: true, margin: item.category ? [0, 1, 0, 0] : [0, 0, 0, 0] });

  if (item.description) {
    stack.push({ stack: markdownToPdfmake(item.description), fontSize: 9, color: '#475569', margin: [0, 2, 0, 0] });
  }

  stack.push(...speakerStack(item.speakers));

  return { stack, margin: [0, 0, 0, 0] };
}

function venueBlock(venueName, sessions) {
  const rowLayout = {
    // Thin black rule under the venue heading (table top), hairlines between rows.
    hLineWidth: (i, node) => (i === 0 ? 0.8 : i === node.table.body.length ? 0 : 0.5),
    vLineWidth: () => 0,
    hLineColor: (i) => (i === 0 ? '#000000' : '#d1d5db'),
    paddingTop: () => 7,
    paddingBottom: () => 7,
    paddingLeft: () => 0,
    paddingRight: () => 6
  };

  return [
    { text: `${String(venueName).toUpperCase()}`, bold: true, fontSize: 11, margin: [0, 10, 0, 0] },
    {
      table: {
        widths: [TIME_COL_WIDTH, '*'],
        body: sessions.map((item) => [
          { text: formatTimeRange(item), fontSize: 9 },
          sessionCell(item)
        ])
      },
      layout: rowLayout
    }
  ];
}

// Keep only the selected venues; drop dates left with no sessions.
// A null/empty selection means "all venues".
function filterAgendaByVenues(agenda, venues) {
  if (!Array.isArray(venues) || venues.length === 0) return agenda;

  const allow = new Set(venues);
  const filtered = {};

  for (const [dateLabel, venueMap] of Object.entries(agenda)) {
    const kept = {};
    for (const [venueName, sessions] of Object.entries(venueMap)) {
      if (allow.has(venueName)) kept[venueName] = sessions;
    }
    if (Object.keys(kept).length) filtered[dateLabel] = kept;
  }

  return filtered;
}

function buildDocDefinition({ eventName, agenda, logo }) {
  const content = [];
  let firstPage = true;

  // One page per venue, each starting with the event name and date heading.
  for (const [dateLabel, venues] of Object.entries(agenda)) {
    for (const [venueName, sessions] of Object.entries(venues)) {
      if (!Array.isArray(sessions) || sessions.length === 0) continue;

      const headerColumns = [
        {
          width: '*',
          stack: [
            { text: eventName || 'Event', fontSize: 18, bold: true },
            { text: dateHeadingRuns(dateLabel, sessions[0]), fontSize: 15, margin: [0, 4, 0, 0] }
          ]
        }
      ];
      if (logo) {
        headerColumns.push({ svg: logo, width: 70, alignment: 'right' });
      }

      const headerRow = { margin: [0, 0, 0, 6], columns: headerColumns };
      if (!firstPage) headerRow.pageBreak = 'before';
      firstPage = false;

      content.push(headerRow);
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 2 }]
      });
      content.push(...venueBlock(venueName, sessions));
    }
  }

  return {
    content,
    defaultStyle: { fontSize: 10, color: '#111111' },
    pageMargins: [40, 40, 40, 50],
    footer: (currentPage, pageCount) => ({
      margin: [40, 10, 40, 0],
      text: `${currentPage} / ${pageCount}`,
      alignment: 'right',
      fontSize: 8,
      color: '#94a3b8'
    })
  };
}

/**
 * Build the agenda PDF from the venue-API payload and either open it in a new
 * tab (action 'view') or download it (action 'download'). pdfMake and marked
 * are lazy-loaded from a CDN on first call.
 *
 * @param {object}  opts
 * @param {string}  opts.eventName  heading shown on each page
 * @param {string}  opts.slug       download filename stem
 * @param {object}  opts.venueData  `{ agenda }` (e.g. loadAgendaData result)
 * @param {string} [opts.action]    'download' (default) | 'view'
 * @param {string[]} [opts.venues]  optional venue allow-list; null = all
 * @param {string} [opts.logo]      raw <svg> markup or http(s) URL; '' = none
 * @returns {Promise<boolean>} false when there is no agenda to render
 */
export async function generateAgendaPdf({ eventName, slug, venueData, action = 'download', venues = null, logo = '' }) {
  const agenda = filterAgendaByVenues(venueData?.agenda ?? {}, venues);
  if (!agenda || Object.keys(agenda).length === 0) {
    return false;
  }

  await ensurePdfLibs();
  const logoSvg = await resolveLogo(logo);

  const docDefinition = buildDocDefinition({ eventName, agenda, logo: logoSvg });
  const pdf = window.pdfMake.createPdf(docDefinition);

  if (action === 'download') {
    pdf.download(`${slug || 'event'}-agenda.pdf`);
  } else {
    pdf.open();
  }

  return true;
}
