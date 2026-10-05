/**
 * Registration (type level): the adapter's component .d.ts files augment core's
 * element registries and Vue's GlobalComponents. This only works when the dist
 * declaration chain survived packaging (`declare module` blocks plus the
 * rewritten `#shorthands` imports), so it can only be proven against the
 * tarballs. Everything is derived from the adapter's canonical schema, never
 * from adapter-specific names.
 *
 * Activation comes from `../adapter`: in vite cells it imports
 * `<adapter>/components`; in nuxt cells it deliberately does NOT — there the
 * @vueform/nuxt module's generated type template must activate the
 * augmentations on its own, which this file then witnesses.
 */
import '../adapter'
import { schema } from '../schema'
import type { Equal, Expect, Extends, Not } from './helpers'
import type { ElementNameOfType, ElementNames } from '@vueform/core'
import type { GlobalComponents } from 'vue'

// The canonical control's type string resolves to a registered element name
// (ElementNameOfType gives `never` when the registry augmentation is gone).
type TextName = ElementNameOfType<(typeof schema)['text']['type']>
type SelectName = ElementNameOfType<(typeof schema)['select']['type']>
type GroupName = ElementNameOfType<(typeof schema)['group']['type']>
type ListName = ElementNameOfType<(typeof schema)['list']['type']>

type _TextRegistered = Expect<Not<Equal<TextName, never>>>
type _SelectRegistered = Expect<Not<Equal<SelectName, never>>>
type _GroupRegistered = Expect<Not<Equal<GroupName, never>>>
type _ListRegistered = Expect<Not<Equal<ListName, never>>>
type _TextInRegistry = Expect<Extends<TextName, ElementNames>>

// The same components are registered as Vue global components.
type _GlobalHasForm = Expect<Extends<'VfForm', keyof GlobalComponents>>
type _GlobalHasText = Expect<Extends<TextName, keyof GlobalComponents>>
type _GlobalFormIsReal = Expect<Not<Equal<GlobalComponents['VfForm'], never>>>
