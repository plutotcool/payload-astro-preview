import type { RootLivePreviewConfig } from 'payload'

// same arguments Payload hands to `admin.livePreview.url`
export type PreviewUrlArgs = Parameters<
  Extract<RootLivePreviewConfig['url'], (...args: never[]) => unknown>
>[0]

export type PayloadAstroPreviewOptions = {
  // origin of the Astro site, e.g. https://preview.example.com
  siteURL: string
  // shared with the Astro integration; signs and verifies the preview link
  secret: string
  // path of the preview route on the site, defaults to /api/preview
  path?: string
  // lifetime of the signed link in milliseconds, defaults to 5 minutes
  ttl?: number
  // site path to open for a given document, or null when it has no preview
  preview: (args: PreviewUrlArgs) => string | null
  // forwarded to `admin.livePreview`, whose `url` this plugin owns
  livePreview?: Omit<RootLivePreviewConfig, 'url'>
}
