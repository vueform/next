/*
 * Compile-time assertions for `useModel` / `useForm` typing. This file is not
 * imported at runtime; vue-tsc / tsc validates it (`pnpm tsc:types`).
 *
 * Covers:
 * - useModel schema → ModelInstance model inference (incl. flat groups)
 * - path-typed get / set
 * - the model argument acceptance matrix (plain, partial, ref, reactive,
 *   instance) for both useModel and useForm
 * - useForm tuple member typing (form$ context, formReady)
 * - useForm `on*` event-handler contextual typing (`onSubmit`)
 */
import { defineComputedSchema, useForm, useModel, type FormContext } from '@vueform/core'
import '@vueform/core/components'
import { reactive, ref } from 'vue'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type IsAny<T> = 0 extends 1 & T ? true : false

// ---------------------------------------------------------------------------
// useModel — model inference
// ---------------------------------------------------------------------------

const model$ = useModel({
  name: { type: 'text' },
  age: { type: 'text', forceNumbers: true },
  subscribe: { type: 'checkbox' },
  tags: { type: 'checkboxes' },
  address: {
    type: 'group',
    schema: {
      city: { type: 'text' },
    },
  },
  billing: {
    type: 'group',
    nested: true,
    schema: {
      iban: { type: 'text' },
    },
  },
})

type Model = typeof model$.model

// A text element models as `string | number | null` (numeric strings may be
// normalized to numbers).
type TextModel = string | number | null

type _modelNotAny = Expect<IsAny<Model> extends false ? true : false>
type _nameIsText = Expect<Equal<Model['name'], TextModel>>
type _subscribeIsBool = Expect<Equal<Model['subscribe'], boolean>>

// Flat group children live at the root; nested groups nest.
type _flatCity = Expect<Equal<Model['city'], TextModel>>
type _nestedIban = Expect<Equal<Model['billing'], { iban: TextModel }>>

// Unwrapped reactive state — plain values, no refs.
type _dirtyIsBool = Expect<Equal<typeof model$.dirty, boolean>>
type _emptyIsBool = Expect<Equal<typeof model$.empty, boolean>>
type _adoptedIsBool = Expect<Equal<typeof model$.adopted, boolean>>
type _initialIsModel = Expect<Equal<typeof model$.initialModel, Model>>

// Path-typed get / set.
const _getName: TextModel = model$.get('name')
const _getWhole: Model = model$.get()
model$.set('name', 'John')
model$.set('address.city', 'Berlin')
// @ts-expect-error subscribe is a boolean field
model$.set('subscribe', 5)

// Unknown paths stay accepted (loose escape hatch), returning any.
model$.get('unknown.path')
model$.set('unknown.path', 5)

// update / load accept deep partials.
model$.update({ name: 'John' })
model$.load({ billing: { iban: 'DE123' } })

// ---------------------------------------------------------------------------
// useModel — computed schema acceptance
// ---------------------------------------------------------------------------

// A defineComputedSchema getter result infers the same model as a plain
// schema.
const computedSchema = defineComputedSchema(() => ({
  name: { type: 'text' },
  subscribe: { type: 'checkbox' },
}))

const computedModel$ = useModel(computedSchema)

type _computedName = Expect<Equal<(typeof computedModel$.model)['name'], TextModel>>
type _computedSubscribe = Expect<Equal<(typeof computedModel$.model)['subscribe'], boolean>>

// Plain-schema validation keeps reporting inline at the offending property
// (the ref union member in the parameter must not degrade it).
useModel({
  bad_multi: {
    type: 'select',
    items: ['a', 'b'],
    multiple: true,
    // @ts-expect-error — multiple select requires an array model
    default: 'a',
  },
})

// ---------------------------------------------------------------------------
// useModel — model argument acceptance
// ---------------------------------------------------------------------------

// The full acceptance matrix is intentionally wide (partial and extra keys
// are allowed), so there are no negative cases here.
useModel({ name: { type: 'text' } }, { name: 'John' })
useModel({ name: { type: 'text' } }, {})
useModel({ name: { type: 'text' } }, { extra: 'accepted' })

// ---------------------------------------------------------------------------
// useForm — tuple typing and model acceptance matrix
// ---------------------------------------------------------------------------

const [_MyForm, form$, formReady] = useForm({
  schema: {
    name: { type: 'text' },
    address: {
      type: 'group',
      schema: {
        city: { type: 'text' },
      },
    },
  },
})

type _myFormIsComponent = Expect<IsAny<typeof _MyForm> extends false ? true : false>

// form$ is the schema-narrowed form context.
type FormModel = typeof form$.model
type _formModelName = Expect<Equal<FormModel['name'], TextModel>>
type _formModelFlatCity = Expect<Equal<FormModel['city'], TextModel>>

const _found = form$.find('name')
const _getCity: TextModel = form$.get('city')
form$.set('name', 'John')
form$.update({ name: 'John' })

// formReady: callback form and promise form.
formReady((ready$) => {
  const _model: FormModel = ready$.model
})
const _readyPromise: Promise<typeof form$> = formReady()

// Model argument matrix.
useForm({ schema: { name: { type: 'text' } } }, { name: 'John' })
useForm({ schema: { name: { type: 'text' } } }, ref({ name: 'John' }))
useForm({ schema: { name: { type: 'text' } } }, ref<Record<string, any> | undefined>(undefined))
useForm({ schema: { name: { type: 'text' } } }, reactive({ name: 'John' }))
useForm({ schema: { name: { type: 'text' } } }, useModel({ name: { type: 'text' } }))
useForm({ schema: { name: { type: 'text' } } }, { extra: 'accepted' })

// Event handlers (`onSubmit`, …) are contextually typed from VfFormEmits.
useForm({
  schema: { name: { type: 'text' } },
  onSubmit: (payload, context$) => {
    type _payload = Expect<Equal<typeof payload, FormData | Record<string, any>>>
    type _ctxNotAny = Expect<IsAny<typeof context$> extends false ? true : false>
    const _name: TextModel = context$.get('name')
  },
})

// Annotating `context$` must not strip contextual typing from `payload`.
useForm({
  schema: { name: { type: 'text' } },
  onSubmit: (payload, _context$: FormContext) => {
    type _payload = Expect<Equal<typeof payload, FormData | Record<string, any>>>
  },
})

// Extra attrs still match the typed overload (catch-all is `unknown`, not `any`).
useForm({ schema: { name: { type: 'text' } }, id: 'register' })

// Wide usage without a concrete schema stays loose.
const [, _wideForm$] = useForm()
type _wideModel = Expect<Equal<typeof _wideForm$.model, Record<string, any>>>

export {}
