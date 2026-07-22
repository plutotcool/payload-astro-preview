import { CMS_URL } from 'astro:env/server'

export type Page = {
  title: string
  slug: string
  body?: string | null
  _status?: 'draft' | 'published'
}

export async function getPage(
  slug: string,
  { preview }: { preview: boolean },
): Promise<Page | null> {
  const url = new URL('/api/pages', CMS_URL)
  url.searchParams.set('where[slug][equals]', slug)
  url.searchParams.set('limit', '1')

  if (preview) {
    url.searchParams.set('draft', 'true')
  } else {
    url.searchParams.set('where[_status][equals]', 'published')
  }

  const response = await fetch(url)
  if (!response.ok) return null

  const { docs } = (await response.json()) as { docs: Page[] }

  return docs[0] ?? null
}
