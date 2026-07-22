import type { APIRoute } from 'astro'

import { verify } from '../../token'
import { setPreviewCookie } from '../cookie'
import { getPreviewSecret } from '../secret'

export const prerender = false

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const secret = getPreviewSecret()

  if (!secret) {
    return new Response('CMS_PREVIEW_SECRET is not configured', { status: 500 })
  }

  const path = url.searchParams.get('path')
  const token = url.searchParams.get('token')
  const expires = url.searchParams.get('expires')

  if (!path || !token || !expires) {
    return new Response('Invalid preview link', { status: 400 })
  }

  if (Number(expires) < Date.now()) {
    return new Response('Preview link expired', { status: 401 })
  }

  if (!(await verify(secret, `${path}:${expires}`, token))) {
    return new Response('Invalid preview link', { status: 401 })
  }

  await setPreviewCookie(cookies, secret, url.protocol === 'https:')

  return redirect(path, 302)
}
