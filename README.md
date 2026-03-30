# Agenda Embed

Embeddable Svelte agenda widget bundled as a single browser script.

## Install

```bash
npm install
```

## Local Development

```bash
npm run dev
```

The repo includes a simple `index.html` demo page. Point the demo element's `data-url` and `data-agenda` values at a working backend.

## Build

```bash
npm run build
```

This produces:

```text
dist/agenda-embed.js
```

## Publish To npm

The package is configured to publish as:

```text
@kerala-startup-mission/agenda
```

Publish flow:

```bash
npm login
npm publish
```

`prepublishOnly` runs the build automatically before publishing.

After publish, the bundle can be used from jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@kerala-startup-mission/agenda@1.0.0/dist/agenda-embed.js"></script>
```

Or via unpkg:

```html
<script src="https://unpkg.com/@kerala-startup-mission/agenda@1.0.0/dist/agenda-embed.js"></script>
```

## Embed Snippet

```html
<div
  data-agenda="my-event"
  data-url="https://api.example.com"
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

## Required Attributes

- `data-agenda`: event slug or ID
- `data-url`: API base URL

## Optional Attributes

- `data-border`
- `data-bg`
- `data-select`
- `data-text`
- `data-round`
- `data-color-1`
- `data-color-2`

These map directly to the widget's current class-based visual props.

## Runtime API

The script auto-initializes all `[data-agenda]` elements on page load.

It also exposes:

```js
window.AgendaEmbed.init();
window.AgendaEmbed.init(rootElement);
```

Use `init()` to scan the whole document again, or pass a container/root element to initialize newly inserted agenda nodes in dynamic pages.

## Notes

- The default build is self-contained. No extra stylesheet link is required.
- The backend contract remains `${data-url}/api/event/${data-agenda}/agenda/venue`.
