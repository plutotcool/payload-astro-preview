export const PREVIEW_COOKIE = 'payload_preview'

export const PREVIEW_PATH = '/api/preview'

// declared on the Astro env schema by the integration, shared with the CMS plugin
export const PREVIEW_SECRET_NAME = 'CMS_PREVIEW_SECRET'

// lifetime of the signed link handed to the browser by the CMS
export const PREVIEW_LINK_TTL = 300_000 // 5 minutes

// lifetime of the preview session cookie set once the link is redeemed
export const PREVIEW_SESSION_TTL = 86_400_000 // 24 hours
