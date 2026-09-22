import { planAutoRegister, registrationSnippet } from './autoregister.mjs'
import { CONFIG_FILENAME, setConfigValue } from './config.mjs'
import { detectProjectType } from './project.mjs'
import { canPrompt, confirm } from './prompt.mjs'

/**
 * Shared closing move of `copy` and `clone`: make sure the barrel ends up
 * registered — a note when it already is, the safe automatic edit (offered only
 * on the first-ever run), or the printed manual snippet.
 */
export async function concludeRegistration({
  cwd,
  dir,
  configPath,
  oneOff,
  yes,
  firstRun,
  out,
}) {
  const nuxt = detectProjectType(cwd) === 'nuxt'
  const snippet = () => out.log(`\n${registrationSnippet(dir)}`)

  if (nuxt) {
    out.log(
      [
        '',
        `Nuxt detected — register the generated barrel (${dir}) through the`,
        '`components` map of your Vueform configuration so your copies override',
        'the built-in components.',
      ].join('\n')
    )
    return
  }

  if (oneOff) {
    snippet()
    return
  }

  const registration = await planAutoRegister(cwd, dir)

  if (registration.status === 'registered') {
    out.log(
      `\nYour copies are registered automatically (${registration.rel} imports the barrel).`
    )
  } else if (registration.status === 'possible' && firstRun) {
    let accept = yes ? true : null

    if (accept === null && canPrompt()) {
      out.log(
        [
          '',
          `vueform can register your copies automatically by updating ${registration.rel}:`,
          '',
          ...registration.preview.map((line) => `  ${line}`),
          '',
        ].join('\n')
      )
      accept = await confirm(`Update ${registration.rel}?`)
    }

    if (accept === true) {
      registration.apply()
      out.log(
        `\nUpdated ${registration.rel} — your copies are now registered automatically.`
      )
    } else if (accept === false) {
      setConfigValue(configPath, 'autoRegister', false)
      snippet()
      out.log(
        `\n(Won't ask again — remove autoRegister from ${CONFIG_FILENAME} to re-enable.)`
      )
    } else {
      snippet()
    }
  } else {
    snippet()
  }
}
