# Agenda Embed

Embeddable agenda and speakers widgets bundled as a single browser script.

## Install

```bash
npm install
```

## Local Development

```bash
npm run dev
```

The repo includes a simple `index.html` demo page. Point the demo elements' `data-url`, `data-agenda`, and `data-speakers` values at a working backend.

## Build

```bash
npm run build
```

This produces:

```text
dist/agenda-embed.js
```

The bundle can be used from jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@kerala-startup-mission/agenda@1.0.2/dist/agenda-embed.js"></script>
```

Or via unpkg:

```html
<script src="https://unpkg.com/@kerala-startup-mission/agenda@1.0.2/dist/agenda-embed.js"></script>
```

## Agenda Embed Snippet

```html
<div
  data-agenda="huddle-global-2024"
  data-url="https://events.startupmission.in/"
  data-border="border-slate-300"
  data-bg="bg-white"
  data-select="bg-slate-900 text-white border-slate-900"
  data-text="text-slate-900"
  data-round="border-slate-900"
  data-color-1="text-slate-500"
  data-color-2="text-slate-600"
></div>

<script src="https://your-cdn.example.com/agenda-embed.js"></script>
```

## Speakers Embed Snippet

```html
<div
  data-speakers="huddle-global-2024"
  data-url="https://events.startupmission.in/"
  data-categories="speaker,government"
  data-border="border-slate-300"
  data-bg="bg-white"
  data-text="text-slate-900"
  data-round="border-slate-900"
  data-color-1="text-slate-500"
  data-color-2="text-slate-600"
></div>

<script src="https://your-cdn.example.com/agenda-embed.js"></script>
```

## React From npm Package

Install:

```bash
npm install @kerala-startup-mission/agenda
```

Minimal React example:

```jsx
import { useEffect, useRef } from 'react';
import AgendaEmbed from '@kerala-startup-mission/agenda';

export default function AgendaWidget() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      AgendaEmbed.init(ref.current);
    }
  }, []);

  return (
    <div
      ref={ref}
      data-agenda="huddle-global-2024"
      data-url="https://events.startupmission.in/"
      data-border="border-slate-300"
      data-bg="bg-white"
      data-select="bg-slate-900 text-white border-slate-900"
      data-text="text-slate-900"
      data-round="border-slate-900"
      data-color-1="text-slate-500"
      data-color-2="text-slate-600"
    />
  );
}
```

Minimal React speakers example:

```jsx
import { useEffect, useRef } from 'react';
import { SpeakersEmbed } from '@kerala-startup-mission/agenda';

export default function SpeakersWidget() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      SpeakersEmbed.init(ref.current);
    }
  }, []);

  return (
    <div
      ref={ref}
      data-speakers="huddle-global-2024"
      data-url="https://events.startupmission.in/"
      data-categories="speaker,government"
      data-border="border-slate-300"
      data-bg="bg-white"
      data-text="text-slate-900"
      data-round="border-slate-900"
      data-color-1="text-slate-500"
      data-color-2="text-slate-600"
    />
  );
}
```

Minimal custom data loading example:

```jsx
import { useEffect, useState } from 'react';
import { loadAgendaData, loadSpeakersData } from '@kerala-startup-mission/agenda';

export default function CustomEventUi() {
  const [agenda, setAgenda] = useState(null);
  const [speakers, setSpeakers] = useState(null);

  useEffect(() => {
    async function load() {
      const [agendaData, speakersData] = await Promise.all([
        loadAgendaData({
          url: 'https://events.startupmission.in',
          event: 'huddle-global-2024'
        }),
        loadSpeakersData({
          url: 'https://events.startupmission.in',
          event: 'huddle-global-2024',
          categories: 'speaker,government'
        })
      ]);

      setAgenda(agendaData);
      setSpeakers(speakersData);
    }

    load().catch(console.error);
  }, []);

  return (
    <pre>
      {JSON.stringify({ agenda, speakers }, null, 2)}
    </pre>
  );
}
```

Use a dedicated container element and let the widget own everything inside that node after initialization.

## Data Loaders

Named exports are available for custom UIs:

```js
import { loadAgendaData, loadSpeakersData } from '@kerala-startup-mission/agenda';
```

`loadAgendaData({ url, event })` returns:

- `raw`
- `agenda`
- `categories`
- `venues`
- `dates`
- `venuesByDate`

`loadSpeakersData({ url, event, categories? })` returns:

- `raw`
- `speakers`

`loadSpeaker({ url, event, hid })` fetches a single speaker's detail from
`${url}/api/event/${event}/speakers/${hid}` and returns the unwrapped speaker
object (the response's `data` key if present, otherwise the raw body):

```js
import { loadSpeaker } from '@kerala-startup-mission/agenda';

const speaker = await loadSpeaker({ url, event, hid: speakerId });
// { name, designation, organisation, photo, linkedin, bio?, agendas? }
```

`hid` is the per-speaker identifier from the list payload (`id`). When the
detail payload includes an `agendas` array, each item may carry its own grouped
`speakers` (`{ category: [...] }`).

The loaders throw on network failure or non-OK responses.

## Speaker Modal Component

`SpeakerModal` is the reusable dialog used by both widgets. Import it into any
Svelte UI to render speaker detail yourself:

```js
import { SpeakerModal, loadSpeaker } from '@kerala-startup-mission/agenda';
```

```svelte
<script>
  import { SpeakerModal, loadSpeaker } from '@kerala-startup-mission/agenda';

  export let url;
  export let event;

  let open = false;
  let loading = false;
  let error = '';
  let speaker = null;

  async function show(hid) {
    open = true;
    loading = true;
    error = '';
    speaker = null;
    try {
      speaker = await loadSpeaker({ url, event, hid });
    } catch (e) {
      error = 'Unable to load the speaker right now.';
    } finally {
      loading = false;
    }
  }
</script>

<button on:click={() => show(someSpeakerId)}>Open</button>

<SpeakerModal
  {open}
  {loading}
  {error}
  {speaker}
  bg_color="bg-white"
  border_color="border-black"
  text_color="text-black"
  sub_color="text-gray-500"
  category_color="text-blue-600"
  speaker_border="border-black"
  on:select={(e) => show(e.detail)}
  on:close={() => (open = false)}
/>
```

Props:

- `open` (bool) — mount/show the dialog.
- `loading` (bool), `error` (string), `speaker` (object|null) — render state.
- Color props (`bg_color`, `border_color`, `text_color`, `sub_color`,
  `category_color`, `speaker_border`) — Tailwind class strings.

Events:

- `close` — fired on Esc, backdrop click, or the close button.
- `select` — fired with a speaker `hid` (`event.detail`) when an agenda-item
  speaker is clicked; call `loadSpeaker` again with it to drill in.

The dialog is portaled to `document.body` so `position: fixed` centres on the
viewport regardless of the host container. It requires the embed stylesheet,
which the default self-contained build injects automatically.

## Required Attributes

- `data-agenda`: event slug or ID
- `data-url`: API base URL
- `data-speakers`: event slug or ID for the speakers widget

## Optional Attributes

- `data-categories`
- `data-border`
- `data-bg`
- `data-select`
- `data-text`
- `data-round`
- `data-color-1`
- `data-color-2`

`data-categories` accepts a comma-separated list such as `speaker,government,investor`. The style overrides map directly to the widgets' current class-based visual props.

## Runtime API

The script auto-initializes all `[data-agenda]` and `[data-speakers]` elements on page load.

It also exposes:

```js
window.AgendaEmbed.init();
window.SpeakersEmbed.init();
window.AgendaEmbed.init(rootElement);
window.SpeakersEmbed.init(rootElement);
```

Use `init()` to scan the whole document again, or pass a container/root element to initialize newly inserted agenda or speakers nodes in dynamic pages.

## Notes

- The default build is self-contained. No extra stylesheet link is required.
- The backend contract remains `${data-url}/api/event/${data-agenda}/agenda/venue`.
- The speakers backend contract remains `${data-url}/api/event/${data-speakers}/speakers`.
