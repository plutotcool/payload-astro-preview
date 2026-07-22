import type { Config, Endpoint, Plugin } from 'payload'

import { sign } from '../token'
import type { PayloadAstroPreviewOptions } from './types'

import { PREVIEW_LINK_TTL, PREVIEW_PATH } from '../const'

function isSitePath(path: string): boolean {
  return (
    path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')
  )
}

// relative to Payload's api route, so the admin reaches it at /api/preview
const ENDPOINT_PATH = '/preview'

type ResolvedOptions = PayloadAstroPreviewOptions &
  Required<Pick<PayloadAstroPreviewOptions, 'path' | 'ttl'>>

function endpoint(options: ResolvedOptions): Endpoint {
  return {
    path: ENDPOINT_PATH,
    method: 'get',
    handler: async (req) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const path = new URL(req.url!).searchParams.get('path')

      if (!path || !isSitePath(path)) {
        return Response.json({ error: 'Invalid preview path' }, { status: 400 })
      }

      const expires = Date.now() + options.ttl
      const token = await sign(options.secret, `${path}:${expires}`)

      const url = new URL(options.path, options.siteURL)
      url.searchParams.set('path', path)
      url.searchParams.set('expires', String(expires))
      url.searchParams.set('token', token)

      return Response.redirect(url.href)
    },
  }
}

export function payloadAstroPreview(
  options: PayloadAstroPreviewOptions,
): Plugin {
  const config: ResolvedOptions = {
    path: PREVIEW_PATH,
    ttl: PREVIEW_LINK_TTL,
    ...options,
  }

  return (incoming: Config): Config => {
    const apiRoute = incoming.routes?.api ?? '/api'

    return {
      ...incoming,
      endpoints: [...(incoming.endpoints ?? []), endpoint(config)],
      admin: {
        ...incoming.admin,
        livePreview: {
          ...incoming.admin?.livePreview,
          ...config.livePreview,
          url: (args) => {
            const path = config.preview(args)
            if (!path) return null

            return `${apiRoute}${ENDPOINT_PATH}?path=${encodeURIComponent(path)}`
          },
        },
      },
    }
  }
}
