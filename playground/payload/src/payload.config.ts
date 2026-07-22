import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { payloadAstroPreview } from '@plutotcool/payload-astro-preview/payload'
import { buildConfig } from 'payload'

import { Pages } from './collections/Pages'
import { Users } from './collections/Users'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Pages],
  // seeds a dev login and a draft page
  onInit: async (payload) => {
    const { totalDocs } = await payload.count({ collection: 'users' })
    if (totalDocs > 0) return

    await payload.create({
      collection: 'users',
      data: { email: 'dev@example.com', password: 'password' },
    })

    await payload.create({
      collection: 'pages',
      draft: true,
      data: {
        title: 'Hello draft',
        slug: 'hello',
        body: 'Only visible through a preview session.',
        _status: 'draft',
      },
    })
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./playground.db',
    },
  }),
  plugins: [
    payloadAstroPreview({
      secret: process.env.CMS_PREVIEW_SECRET || '',
      siteURL: process.env.PREVIEW_URL || 'http://localhost:4321',
      preview: ({ data, collectionConfig }) =>
        collectionConfig?.slug === 'pages' && data.slug
          ? `/${data.slug}`
          : null,
      livePreview: {
        collections: ['pages'],
      },
    }),
  ],
})
