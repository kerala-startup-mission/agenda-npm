# Vite React Tailwind Example

This example shows how to host the agenda widget inside a Vite + React + Tailwind app.

## Run

From this folder:

```bash
npm install
npm run dev
```

Before starting Vite, the example copies the built embed bundle from:

```text
../../dist/agenda-embed.js
```

into:

```text
public/agenda-embed.js
```

## Important

Build the root widget bundle first so the example has something to copy:

```bash
cd /Users/ksum/Documents/Sidharth/code/agenda-package
npm run build
```
