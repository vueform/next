import type { BuiltInRules, UserConfig } from '@vueform/core'

export type VueformRuleName = BuiltInRules

export interface ComponentFilter<TName extends string = string> {
  include?: TName[]
  exclude?: TName[]
}

export interface RuleFilter {
  include?: VueformRuleName[]
  exclude?: VueformRuleName[]
}

export interface BaseModuleOptions<TComponentName extends string = string> {
  configPath?: string
  css?: boolean
  locales?: string[]
  components?: TComponentName[] | ComponentFilter<TComponentName>
  rules?: VueformRuleName[] | RuleFilter
  config?: UserConfig
}
