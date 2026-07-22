import { defineMiddleware } from 'astro:middleware'

import { deletePreviewCookie, verifyPreviewCookie } from './cookie'
import { getPreviewSecret } from './secret'

import { PREVIEW_COOKIE } from '../const'

export const onRequest = defineMiddleware(async (context, next) => {
  // prerendered routes run this at build time, where there is no request
  if (context.isPrerendered) return next()

  context.locals.preview = false

  const secret = getPreviewSecret()
  const cookie = context.cookies.get(PREVIEW_COOKIE)?.value

  if (secret && cookie) {
    context.locals.preview = await verifyPreviewCookie(cookie, secret)
    if (!context.locals.preview) deletePreviewCookie(context.cookies)
  }

  return next()
})
