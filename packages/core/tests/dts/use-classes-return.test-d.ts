/**
 * Type-level tests for the `useClasses` return value: the host component's
 * declared class keys plus every key the passed definitions introduce, typed by
 * inference — no module augmentation needed inside the template. Run by `pnpm
 * test-dts`.
 */
import { useClasses, type ClassValue } from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/core/components'

const classes = useClasses('VfText', {
  input: 'my-input',
  icon: 'vf-text-icon',
})

// Keys introduced by a factory definition are inferred from its return type.
const factoryClasses = useClasses('VfText', (el$) => ({
  badge: { 'tpl-on': el$.hasError },
}))

describe('useClasses return value', () => {
  test('a key of the template’s own is typed on the returned object — not `any`', () => {
    expectTypeOf(classes.icon).not.toBeAny()
    expectTypeOf(classes.icon).toEqualTypeOf<ClassValue>()
  })

  test('built-in keys keep their declared type, whether overridden or untouched', () => {
    expectTypeOf(classes.input).toEqualTypeOf<ClassValue>()
  })

  test('keys introduced by a factory definition are inferred from its return type', () => {
    expectTypeOf(factoryClasses.badge).not.toBeAny()
    expectTypeOf(factoryClasses.badge).toEqualTypeOf<ClassValue>()
  })
})
