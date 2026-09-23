/*
 * Compile-time assertions for the `useClasses` return value: the host
 * component's declared class keys plus every key the passed definitions
 * introduce, typed by inference — no module augmentation needed inside the
 * template. Validated by `pnpm tsc:types`.
 */
import { useClasses, type ClassValue } from '@vueform/core'
import '@vueform/core/components'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type IsAny<T> = 0 extends 1 & T ? true : false

const classes = useClasses('VfText', {
  input: 'my-input',
  icon: 'vf-text-icon',
})

// A key of the template's own is typed on the returned object — not `any`.
type _iconNotAny = Expect<IsAny<typeof classes.icon> extends false ? true : false>
type _iconIsClassValue = Expect<Equal<typeof classes.icon, ClassValue>>
// Built-in keys keep their declared type, whether overridden or untouched.
type _inputStillTyped = Expect<Equal<typeof classes.input, ClassValue>>

// Keys introduced by a factory definition are inferred from its return type.
const factoryClasses = useClasses('VfText', (el$) => ({
  badge: { 'tpl-on': el$.hasError },
}))

type _badgeNotAny = Expect<IsAny<typeof factoryClasses.badge> extends false ? true : false>
type _badgeIsClassValue = Expect<Equal<typeof factoryClasses.badge, ClassValue>>
