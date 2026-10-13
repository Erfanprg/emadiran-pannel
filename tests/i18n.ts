// Registers a translator backed by the real fa messages so tests assert the shown texts.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTranslator } from '../app/i18n/translate'

const dir = join(__dirname, '../app/i18n/locales/fa')
const messages: Record<string, any> = {}
const merge = (target: Record<string, any>, source: Record<string, any>) => {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object') merge((target[key] ||= {}), value)
    else target[key] = value
  }
}
for (const file of readdirSync(dir)) merge(messages, JSON.parse(readFileSync(join(dir, file), 'utf8')))

setTranslator((key, params) => {
  const message = key.split('.').reduce((node, part) => node?.[part], messages)
  if (typeof message !== 'string') return key
  return message.replace(/\{'([^']*)'\}|\{(\w+)\}/g, (_, literal, name) => literal ?? String(params[name]))
})
