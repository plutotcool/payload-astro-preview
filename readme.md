# @plutotcool/payload-astro-preview

Signed draft preview sessions between a Payload CMS and an Astro site. Payload mints a short-lived signed link, Astro redeems it into a preview cookie and exposes `Astro.locals.preview`.

## Install

```sh
pnpm add @plutotcool/payload-astro-preview
```

Install it on both sides — the Payload app and the Astro site — and give them the same `CMS_PREVIEW_SECRET`.

## Flow

1. The admin opens live preview; Payload calls `preview()` to get a site path.
2. The iframe hits the CMS endpoint `/api/preview?path=…`, which requires an authenticated user and signs `path:expires` with the shared secret.
3. It redirects to the site's `/api/preview?path=…&expires=…&token=…`.
4. The site verifies the token, sets an HMAC-signed session cookie (24h) and redirects to `path`.
5. The middleware turns that cookie into `Astro.locals.preview` on every on-demand request. `/api/preview/exit` clears it.

Paths are checked against protocol-relative URLs before they are signed and again before they are redirected to. The cookie only asserts "this browser opened a valid preview link" — which document is previewed comes from the route.

## Payload

```ts
import { payloadAstroPreview } from '@plutotcool/payload-astro-preview/payload'

plugins: [
  payloadAstroPreview({
    secret: process.env.CMS_PREVIEW_SECRET!,
    siteURL: process.env.PREVIEW_URL!,
    preview: ({ data, collectionConfig, locale }) =>
      collectionConfig?.slug === 'funnels' && locale
        ? `/${data.name}/${locale.code}`
        : null,
    livePreview: { collections: ['funnels'] },
  }),
]
```

The plugin owns `admin.livePreview.url`; everything else on `livePreview` (collections, globals, breakpoints) is passed through.

## Astro

```ts
import payloadPreview from '@plutotcool/payload-astro-preview/astro'

integrations: [payloadPreview()]
```

The integration injects the two routes and a `pre` middleware, declares `CMS_PREVIEW_SECRET` on the env schema, and injects the `App.Locals` type.

```astro
const data = await getFunnel(name, locale, { preview: Astro.locals.preview })
```

## Options

Both sides accept `path` (default `/api/preview`) — change it on both or neither. The Payload side accepts `ttl` for the link lifetime (default 5min).

## Playground

`playground/` holds a runnable pair: a Payload app on `:3000` and an Astro site on `:4321`, wired together with a shared secret.

```sh
pnpm install
cp playground/payload/.env.example playground/payload/.env
cp playground/astro/.env.example playground/astro/.env
pnpm dev
```

The CMS seeds `dev@example.com` / `password` and a draft page on first boot. Log into `localhost:3000/admin`, open the draft and hit the live preview tab — the site renders it at `/hello`, which is a 404 without a preview session.

## License

MIT
