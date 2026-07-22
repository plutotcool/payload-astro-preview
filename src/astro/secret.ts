import { getSecret } from 'astro:env/server'

import { PREVIEW_SECRET_NAME } from '../const'

export function getPreviewSecret(): string {
  return getSecret(PREVIEW_SECRET_NAME) ?? ''
}
