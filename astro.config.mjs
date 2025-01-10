import playformCompress from '@playform/compress'
import playformInline from '@playform/inline'

import compressor from 'astro-compressor'
import icon from 'astro-icon'
import sitemap from 'astro-sitemap'
import { defineConfig } from 'astro/config'
import { URL } from './src/data/constants'

const STANDARD_UNIT_SIZE = 16

// https://astro.build/config
export default defineConfig({
  site: URL,
  trailingSlash: 'never',
  server: {
    host: true
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  compressHTML: false,
  vite: {
    build: {
      cssMinify: 'lightningcss'
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        visitor: {
          Length(length) {
            if (length.unit === 'px') {
              return { unit: 'rem', value: length.value / STANDARD_UNIT_SIZE }
            }
          }
        }
      }
    }
  },
  integrations: [
    icon(),
    playformInline(),
    sitemap({
      canonicalURL: URL,
      lastmod: new Date(),
      createLinkInHead: false,
      xmlns: {
        xhtml: true
      },
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es'
        }
      },
      // Remove trailing slash
      serialize(item) {
        item.url = item.url.replace(/\/$/g, '')
        return item
      }
    }),
    playformCompress({
      HTML: {
        collapseBooleanAttributes: true,
        maxLineLength: 0,
        removeAttributeQuotes: false,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        useShortDoctype: true
      },
      JavaScript: {
        compress: {
          ecma: 2015
        },
        format: {
          comments: false,
          ecma: 2015
        },
        ecma: 2015,
        module: true
      },
      Image: false,
      SVG: false
    }),
    compressor()
  ]
})
