import legacy from './locales/fa/legacy.json'
import common from './locales/fa/common.json'
import status from './locales/fa/status.json'
import admin from './locales/fa/admin.json'
import user from './locales/fa/user.json'
import auth from './locales/fa/auth.json'
import landing from './locales/fa/landing.json'
import seo from './locales/fa/seo.json'
import designShowcase from './locales/fa/designShowcase.json'

type Messages = Record<string, any>

/** Deep-merges the per-domain message files (legacy.json shares some top-level keys, e.g. `auth`). */
const merge = (...sources: Messages[]): Messages =>
  sources.reduce<Messages>((target, source) => {
    for (const [key, value] of Object.entries(source)) {
      target[key] = value && typeof value === 'object' && typeof target[key] === 'object'
        ? merge(target[key], value)
        : value
    }
    return target
  }, {})

const fa = merge(legacy, common, status, admin, user, auth, landing, seo, designShowcase)

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'fa',
  messages: {
    fa
  }
}))
