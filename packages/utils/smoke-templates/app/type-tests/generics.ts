/**
 * Generics (type level): SchemaToModel derives the model shape from the
 * canonical schema, and the adapter's bare entry demands the model module
 * (only the batteries-included entry ships preconfigured).
 */
import { createVueform } from '../adapter'
import { schema } from '../schema'
import type { Expect, Extends } from './helpers'
import type { SchemaToModel } from '@vueform/core'

type Model = SchemaToModel<typeof schema>

type _HasText = Expect<Extends<'text', keyof Model>>
type _HasSelect = Expect<Extends<'select', keyof Model>>
// Flat group: children live at the model root.
type _HasFlatGroupChild = Expect<Extends<'city', keyof Model>>
type _HasList = Expect<Extends<'list', keyof Model>>

// The bare entry's factory is createVueformFactory<'model'> — a config
// without modules.model must not typecheck.
// @ts-expect-error the bare entry requires modules.model
createVueform({})

export {}
