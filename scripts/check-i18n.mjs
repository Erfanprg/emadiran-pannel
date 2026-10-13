// Lists Persian text left outside app/i18n/locales (comments are ignored).
// Usage: node scripts/check-i18n.mjs   — exits with 1 when something unexpected is found.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const PERSIAN = /[؀-ۿ]/

// Allowed on purpose:
// - Persian/Arabic digits inside regexes that convert or strip digits
// - field names matched against backend (Persian) validation messages: normalized.includes("…")
const EXCEPTIONS = [
  /\/\[?[^/\n]*[۰-۹٠-٩][^/\n]*\]?\/g?/,
  /normalized\.includes\("[^"]+"\)/
]

const stripComments = (src) =>
  src
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')

const files = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (name !== 'i18n') walk(path)
    } else if (/\.(vue|ts|js)$/.test(name)) files.push(path)
  }
}
walk(APP)

let found = 0
for (const file of files) {
  stripComments(readFileSync(file, 'utf8')).split('\n').forEach((line, i) => {
    if (!PERSIAN.test(line)) return
    const rest = EXCEPTIONS.reduce((text, re) => text.replace(new RegExp(re, 'g'), ''), line)
    if (!PERSIAN.test(rest)) return
    found++
    console.log(`${relative(APP, file)}:${i + 1}: ${line.trim()}`)
  })
}

console.log(found ? `\n${found} line(s) with Persian text outside i18n/locales` : 'OK: no Persian text outside i18n/locales')
process.exitCode = found ? 1 : 0
