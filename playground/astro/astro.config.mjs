import node from '@astrojs/node'
import payloadPreview from '@plutotcool/payload-astro-preview/astro'
import { defineConfig, envField } from 'astro/config'

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [payloadPreview()],
  env: {
    schema: {
      CMS_URL: envField.string({
        context: 'server',
        access: 'public',
        default: 'http://localhost:3000',
      }),
    },
  },
})
