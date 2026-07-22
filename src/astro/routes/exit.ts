import type { APIRoute } from 'astro'

import { deletePreviewCookie } from '../cookie'

export const prerender = false

export const GET: APIRoute = ({ cookies, redirect }) => {
  deletePreviewCookie(cookies)

  return redirect('/', 302)
}
