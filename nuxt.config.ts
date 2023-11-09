import { NuxtConfig } from '@nuxt/types'

const auth0Domain: string = process.env.NUXT_ENV_AUTH0_DOMAIN?.replace(/['"]+/g, '') || '';
const auth0ClientId: string = process.env.NUXT_ENV_AUTH0_CLIENT_ID?.replace(/['"]+/g, '') || '';
const auth0Audience: string = process.env.NUXT_ENV_AUTH0_AUDIENCE?.replace(/['"]+/g, '') || '';
const tables: string[] = process.env.NUXT_ENV_TABLES?.replace(/['"]+/g, '').split(',') || [];

const config: NuxtConfig = {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'GuardianConnector Views',
    script: [
      { src: '/lightbox/lightbox-plus-jquery.js', body: true }    ],
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'mapbox-gl/dist/mapbox-gl.css',
    'static/lightbox/lightbox.min.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    'nuxt-windicss',
    ['@nuxtjs/dotenv', {path: './'}],
    '@nuxtjs/auth-next',
  ],

  serverMiddleware: [
    { path: "/api", handler: "~/api/index.ts" },
  ],

  router: {
    middleware: ['authMiddleware', 'dynamicRoutes'],
    extendRoutes(routes, resolve) {
      // Filter out default Vue routes for pages
      const filteredRoutes = routes.filter(route => {
        return route.name !== 'map' && route.name !== 'gallery';
      });

      // Replace the original routes array with the filtered one
      routes.splice(0, routes.length, ...filteredRoutes);

      tables.forEach((table: string) => {
        routes.push({
          name: `${table}-map`,
          path: `/${table}/map`,
          component: resolve(__dirname, 'pages/map.vue'),
          meta: { tableName: table }
        });

        routes.push({
          name: `${table}-gallery`,
          path: `/${table}/gallery`,
          component: resolve(__dirname, 'pages/gallery.vue'),
          meta: { tableName: table }
        });
      });
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios'
  ],

  auth: {
    strategies: {
      auth0: {
        scheme: '~src/runtimeConfigurableScheme.ts'
      },
      local: {
        token: {
          property: 'token',
          required: true,
          type: 'Bearer',
          maxAge: 1800
        },
        endpoints: {
          login: { url: '/api/login', method: 'post', propertyName: 'token' },
          logout: false,
          user: false
        }
      }
    },
    redirect: {
      login: '/login',
      logout: '/login',
      callback: '/login',
      home: '/'
    }
  },

  axios: {
    baseURL: 'http://127.0.0.1:8080',
    browserBaseURL: '/',  
  },

  publicRuntimeConfig: {
    auth: {
      strategies: {
        auth0: {
          domain: auth0Domain,
          clientId: auth0ClientId,
          endpoints: {
            authorization: `https://${auth0Domain}/authorize`,
          },
          ...(auth0Audience !== "" ? { auth0Audience } : {})
        }
      }
    },
    apiKey: process.env.VUE_APP_API_KEY,
    tables: process.env.NUXT_ENV_TABLES?.replace(/['"]+/g, '').split(',') || [],
    embedMedia: process.env.EMBED_MEDIA?.replace(/['"]+/g, '') || 'NO',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [(context) => context.isLegacy ? 'axios' : undefined, 'defu'],
  },

  server: {
  },
}

export default config
