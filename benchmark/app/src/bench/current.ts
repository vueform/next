import { CASES, type CaseSpec } from './cases'
import { getParams } from './protocol'

export const params = getParams()

const found: CaseSpec | undefined = CASES[params.case]

if (!found) {
  throw new Error(
    `[bench] unknown case "${params.case}" — known: ${Object.keys(CASES).join(', ')}`
  )
}

export const spec: CaseSpec = found
export const schema = spec.schema(params.n)
export const formProps = spec.formProps ?? {}
export const useVModel = !!spec.vmodel
