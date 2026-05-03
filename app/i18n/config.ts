import fa from './locales/fa.json'
// import en from './locales/en.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'fa',
  messages: {
    fa,
    // en
  }
}))
