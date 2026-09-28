/**
 * form$.find / form$.get (type level): known schema paths return the element's
 * schema-narrowed context, nested paths resolve, and unknown paths fall back to
 * the untyped element.
 */
import { useForm } from '../adapter'
import { schema } from '../schema'
import type { Equal, Expect, Extends, Not } from './helpers'

// Never executed — tier 1 only typechecks this file.
const [, form$] = useForm({ schema })

const _text = form$.find('text')
type TextEl = NonNullable<typeof _text>

// A known path returns a real, narrowed element context.
type _TextIsReal = Expect<Not<Equal<TextEl, never>>>
type _TextHasUpdate = Expect<Extends<'update', keyof TextEl>>

// A nested (group child) path resolves.
const _city = form$.find('group.city')
type _CityIsReal = Expect<Not<Equal<NonNullable<typeof _city>, never>>>

// An unknown path is accepted and falls back to the untyped element (any).
const _unknown = form$.find('not-a-real-path')
type _UnknownIsAny = Expect<Equal<typeof _unknown, any>>

// get() returns the element's value for a known path.
const _textValue = form$.get('text')
type _TextValueIsReal = Expect<Not<Equal<typeof _textValue, never>>>

export {}
