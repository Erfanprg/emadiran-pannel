/**
 * Translates a message key outside components (stores, utils, constants, composables).
 * Components use `$t` in templates and `useI18n().t` in `<script setup>`.
 *
 * The translator is registered by plugins/i18n-translate.ts; outside Nuxt (e.g. unit tests)
 * the key itself is returned.
 */
type Translator = (key: string, params: Record<string, unknown>) => string

let translator: Translator = (key) => key

export const setTranslator = (fn: Translator) => {
  translator = fn
}

export const translate = (key: string, params: Record<string, unknown> = {}): string =>
  translator(key, params)
