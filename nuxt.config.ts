// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  pages: true,
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n', '@nuxt/image', '@pinia/nuxt'],
   imports: {
    scan: false,
  },
  css: ['~/assets/css/style.css', '~/assets/css/form.css', '~/assets/css/btn.css', '~/assets/css/datepicker.css'],

  runtimeConfig: {
    // Public keys (client-side accessible)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://api-demo.emadiran.ir/api',
            // apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',

    },
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'fa',
    locales: [
      {
        code: 'fa',
        name: 'فارسی',
        iso: 'fa-IR',
        dir: 'rtl'
      },
    ],
    vueI18n: '~/i18n/config.ts'
  },
  typescript: {
    typeCheck: false,
    strict: false,
  },
})