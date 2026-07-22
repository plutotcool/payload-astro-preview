import type { AstroCookies } from 'astro'

import { sign, verify } from '../token'

import { PREVIEW_COOKIE, PREVIEW_SESSION_TTL } from '../const'

export async function setPreviewCookie(
  cookies: AstroCookies,
  secret: string,
  secure: boolean,
): Promise<void> {
  const timestamp = Date.now()
  const signature = await sign(secret, String(timestamp))

  cookies.set(PREVIEW_COOKIE, `${signature}:${timestamp}`, {
    path: '/',
    maxAge: PREVIEW_SESSION_TTL / 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure,
  })
}

export function deletePreviewCookie(cookies: AstroCookies): void {
  cookies.delete(PREVIEW_COOKIE, { path: '/' })
}

export async function verifyPreviewCookie(
  value: string,
  secret: string,
): Promise<boolean> {
  const [signature, timestamp] = value.split(':')
  if (!signature || !timestamp) return false

  if (Date.now() - Number(timestamp) > PREVIEW_SESSION_TTL) return false

  return verify(secret, timestamp, signature)
}
