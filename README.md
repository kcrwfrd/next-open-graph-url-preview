# next-open-graph-url-preview

A small [Next.js](https://nextjs.org) app for troubleshooting rich link previews. It serves a page with OpenGraph and Twitter card metadata and logs every incoming request with its User-Agent. When you share a link in iMessage, Slack, X, Discord, and similar apps, the logs show which preview fetchers hit the page and the OG image, and what they requested.

## Getting started

```bash
git clone https://github.com/kcrwfrd/next-open-graph-url-preview.git
cd next-open-graph-url-preview
npm install

# prod build instead of dev server is required to work with tunnels
npm run build && npm start
```

Open <http://localhost:3000>. Request logs are printed in the terminal running `npm start`.

## Example log output

```js
{
  ts: '2026-09-18T23:59:12.345Z',
  method: 'GET',
  path: '/',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0',
  isBot: true,
  browser: 'Safari 9.0.1',
  os: 'Mac OS 10.11.1',
  device: undefined
}
```

A preview fetch normally shows up as a request for `/` followed by one for `/opengraph-image.png`.

## Testing locally with a tunnel

Link-preview fetchers run on the messaging service's servers or on the recipient's device, so they can't reach `localhost`. To test your local dev server against real fetchers, expose it through a public tunnel.

With [ngrok](https://ngrok.com), using a reserved domain:

```bash
# terminal 1
npm start

# terminal 2
ngrok http 3000
```

Then share the tunnel URL in iMessage, Slack, or another app, and watch the terminal for the fetcher's requests.

You don't need to configure anything for the tunnel. `getBaseUrl()` reads the forwarded host headers that ngrok sends, so `og:url` and `og:image` resolve to the tunnel domain. To force a specific origin anyway, set `NEXT_PUBLIC_SITE_URL`:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.ngrok-free.dev npm start
```

Tips:

- Most apps cache previews aggressively. Add a throwaway query string (for example `?v=2`) to force a fresh fetch.
- ngrok's local inspector at <http://127.0.0.1:4040> shows the full request headers and lets you replay requests.
- Other tunnels, such as `cloudflared tunnel --url http://localhost:3000`, work the same way.

## How it works

- **Request logging**: [`src/proxy.ts`](src/proxy.ts). A Next.js `proxy` (the replacement for `middleware` in Next 16) logs one entry per request: timestamp, method, path, the raw `user-agent` header, and the fields parsed by `userAgent()` from `next/server` (`isBot`, browser, OS, device type). The matcher skips `_next/static`, `_next/image`, and `favicon.ico`, so pages and `/opengraph-image.png` are both logged.
- **Metadata**: [`src/app/page.tsx`](src/app/page.tsx). `generateMetadata` sets the `openGraph` tags (title, description, url, siteName, locale) and a `summary_large_image` Twitter card.
- **OG image**: [`src/app/opengraph-image.png`](src/app/opengraph-image.png) and [`opengraph-image.alt.txt`](src/app/opengraph-image.alt.txt). Next.js picks these up by file-name convention and emits `og:image` with width, height, type, and alt.
- **Absolute URLs**: [`src/app/layout.tsx`](src/app/layout.tsx) and [`src/lib/site-url.ts`](src/lib/site-url.ts). The root layout sets `metadataBase` from `getBaseUrl()`. It uses `NEXT_PUBLIC_SITE_URL` if that's set. Otherwise it builds the URL from the `x-forwarded-host`, `x-forwarded-proto`, and `host` headers, so OG URLs point at whatever public host served the request, tunnels included.

## Customizing the preview

- Edit `TITLE` and `DESCRIPTION` in `src/app/page.tsx`.
- Replace `src/app/opengraph-image.png` (1200×630 is the usual size) and update `opengraph-image.alt.txt`.

## Scripts

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the dev server on :3000   |
| `npm run build` | Build for production            |
| `npm run start` | Serve the production build      |
| `npm run lint`  | Run ESLint                      |
