import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'payload/index': 'src/payload/index.ts',
    'astro/index': 'src/astro/index.ts',
    'astro/middleware': 'src/astro/middleware.ts',
    'astro/routes/enter': 'src/astro/routes/enter.ts',
    'astro/routes/exit': 'src/astro/routes/exit.ts',
  },
  external: [/^astro:/, /^node:/],
  copy: [{ from: 'src/astro/locals.d.ts', to: 'dist/astro' }],
  outDir: 'dist',
  format: 'esm',
  platform: 'neutral',
  sourcemap: true,
  dts: true,
})
