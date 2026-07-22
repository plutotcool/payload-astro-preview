const encoder = new TextEncoder()

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): ArrayBuffer | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/.test(hex)) return null

  const buffer = new ArrayBuffer(hex.length / 2)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }

  return buffer
}

export async function sign(secret: string, data: string): Promise<string> {
  const key = await importKey(secret)
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
}

export async function verify(
  secret: string,
  data: string,
  signature: string,
): Promise<boolean> {
  const buffer = fromHex(signature)
  if (!buffer) return false

  const key = await importKey(secret)
  return crypto.subtle.verify('HMAC', key, buffer, encoder.encode(data))
}
