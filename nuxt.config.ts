import { NuxtConfig } from '@nuxt/types'

const getAuthConfig = () => {
  return {
    strategies: {
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
      home: '/map', // Redirect to /map after login
    }
  };
};

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
    '~/api/index.ts'
  ],

  router: {
    middleware: ['authMiddleware']
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios'
  ],

  auth: getAuthConfig(),

  axios: {
    baseURL: 'http://127.0.0.1:8080',
    browserBaseURL: '/',  
  },

  publicRuntimeConfig: {
    apiKey: process.env.VUE_APP_API_KEY,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [(context) => context.isLegacy ? 'axios' : undefined, 'defu'],
  },

  server: {
  },
}

export default config