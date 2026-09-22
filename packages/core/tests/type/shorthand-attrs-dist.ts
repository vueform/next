/*
 * Dist-only assertions for `part:*` / `class:*` / `reclass:*` shorthand attrs.
 * Requires a prior core build (`vite build`) so `shorthands.d.ts` exists.
 *
 * Source `Vf*Props` stay clean; vf-build injects these keys into published
 * types via the `#shorthands` marker on each `unstyled.ts`.
 */
import '../../dist/components/VfSelect/unstyled'
import '../../dist/components/VfText/unstyled'
import type { VfSelectProps } from '../../dist/components/VfSelect/types'
import type { VfTextProps } from '../../dist/components/VfText/types'

type Expect<T extends true> = T
type HasKey<T, K extends string> = K extends keyof T ? true : false

type _textPart = Expect<HasKey<VfTextProps, 'part:input'>>
type _textClass = Expect<HasKey<VfTextProps, 'class:input'>>
type _textReclass = Expect<HasKey<VfTextProps, 'reclass:input'>>
type _textOwn = Expect<HasKey<VfTextProps, 'inputType'>>

type _selectPart = Expect<HasKey<VfSelectProps, 'part:input'>>
type _selectClass = Expect<HasKey<VfSelectProps, 'class:input'>>
type _selectReclass = Expect<HasKey<VfSelectProps, 'reclass:input'>>
type _selectOwn = Expect<HasKey<VfSelectProps, 'items'>>

type TextPartInput = NonNullable<VfTextProps['part:input']>
type _textPartCallable = Expect<Extract<TextPartInput, (...args: any) => any> extends never ? false : true>

type SelectClassInput = NonNullable<VfSelectProps['class:input']>
type _selectClassCallable = Expect<Extract<SelectClassInput, (...args: any) => any> extends never ? false : true>

export type _ok = [_textPart, _textClass, _textReclass, _textOwn, _selectPart, _selectClass, _selectReclass, _selectOwn, _textPartCallable, _selectClassCallable]
