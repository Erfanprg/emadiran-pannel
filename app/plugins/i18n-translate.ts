import { setTranslator } from '~/i18n/translate'

// Lets code outside components translate through the app's i18n instance.
export default defineNuxtPlugin((nuxtApp) => {
  setTranslator((key, params) => nuxtApp.$i18n.t(key, params))
})
