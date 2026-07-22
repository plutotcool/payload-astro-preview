import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import type { AstroIntegration } from 'astro'
import { envField } from 'astro/config'

import { PREVIEW_PATH, PREVIEW_SECRET_NAME } from '../const'

const PACKAGE = '@plutotcool/payload-astro-preview'

const LOCALS_DTS = readFileSync(
  fileURLToPath(new URL('./locals.d.ts', import.meta.url)),
  'utf8',
)

export type PayloadPreviewOptions = {
  // path of the preview route, defaults to /api/preview; must match the CMS plugin
  path?: string
}

export default function payloadPreview(
  options: PayloadPreviewOptions = {},
): AstroIntegration {
  const path = options.path ?? PREVIEW_PATH

  return {
    name: PACKAGE,
    hooks: {
      'astro:config:setup': ({ injectRoute, addMiddleware, updateConfig }) => {
        injectRoute({
          pattern: path,
          entrypoint: `${PACKAGE}/astro/routes/enter`,
          prerender: false,
        })

        injectRoute({
          pattern: `${path}/exit`,
          entrypoint: `${PACKAGE}/astro/routes/exit`,
          prerender: false,
        })

        addMiddleware({
          entrypoint: `${PACKAGE}/astro/middleware`,
          order: 'pre',
        })

        updateConfig({
          env: {
            schema: {
              [PREVIEW_SECRET_NAME]: envField.string({
                context: 'server',
                access: 'secret',
                optional: true,
              }),
            },
          },
        })
      },

      'astro:config:done': ({ injectTypes }) => {
        injectTypes({ filename: 'locals.d.ts', content: LOCALS_DTS })
      },
    },
  }
}
