/*
 * Type-level tests for `useModel` / `useForm` typing. This file is not
 * imported at runtime; it is only typechecked. Run by `pnpm test:dts`.
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
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/core/components'
import { reactive, ref } from 'vue'

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

describe('useModel model inference', () => {
  test('schema infers the model shape', () => {
    expectTypeOf<Model>().not.toBeAny()
    expectTypeOf<Model['name']>().toEqualTypeOf<TextModel>()
    expectTypeOf<Model['subscribe']>().toEqualTypeOf<boolean>()
  })

  test('flat group children live at the root; nested groups nest', () => {
    expectTypeOf<Model['city']>().toEqualTypeOf<TextModel>()
    expectTypeOf<Model['billing']>().toEqualTypeOf<{ iban: TextModel }>()
  })

  test('unwrapped reactive state — plain values, no refs', () => {
    expectTypeOf(model$.dirty).toEqualTypeOf<boolean>()
    expectTypeOf(model$.empty).toEqualTypeOf<boolean>()
    expectTypeOf(model$.adopted).toEqualTypeOf<boolean>()
    expectTypeOf(model$.initialModel).toEqualTypeOf<Model>()
  })

  test('path-typed get / set', () => {
    expectTypeOf(model$.get('name')).toExtend<TextModel>()
    expectTypeOf(model$.get()).toExtend<Model>()
    model$.set('name', 'John')
    model$.set('address.city', 'Berlin')
    // @ts-expect-error subscribe is a boolean field
    model$.set('subscribe', 5)

    // Unknown paths stay accepted (loose escape hatch), returning any.
    model$.get('unknown.path')
    model$.set('unknown.path', 5)
  })

  test('update / load accept deep partials', () => {
    model$.update({ name: 'John' })
    model$.load({ billing: { iban: 'DE123' } })
  })
})

describe('useModel computed schema acceptance', () => {
  // A defineComputedSchema getter result infers the same model as a plain
  // schema.
  const computedSchema = defineComputedSchema(() => ({
    name: { type: 'text' },
    subscribe: { type: 'checkbox' },
  }))

  const _computedModel$ = useModel(computedSchema)

  test('computed schema infers the same model as a plain schema', () => {
    expectTypeOf<(typeof _computedModel$.model)['name']>().toEqualTypeOf<TextModel>()
    expectTypeOf<(typeof _computedModel$.model)['subscribe']>().toEqualTypeOf<boolean>()
  })

  test('plain-schema validation keeps reporting inline at the offending property', () => {
    // (The ref union member in the parameter must not degrade it.)
    useModel({
      bad_multi: {
        type: 'select',
        items: ['a', 'b'],
        multiple: true,
        // @ts-expect-error — multiple select requires an array model
        default: 'a',
      },
    })
  })
})

describe('useModel model argument acceptance', () => {
  test('the acceptance matrix is intentionally wide (partial and extra keys allowed)', () => {
    // No negative cases here by design.
    useModel({ name: { type: 'text' } }, { name: 'John' })
    useModel({ name: { type: 'text' } }, {})
    useModel({ name: { type: 'text' } }, { extra: 'accepted' })
  })
})

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

// form$ is the schema-narrowed form context.
type FormModel = typeof form$.model

describe('useForm tuple typing and model acceptance matrix', () => {
  test('the returned component is not any', () => {
    expectTypeOf(_MyForm).not.toBeAny()
  })

  test('form$ is the schema-narrowed form context', () => {
    expectTypeOf<FormModel['name']>().toEqualTypeOf<TextModel>()
    expectTypeOf<FormModel['city']>().toEqualTypeOf<TextModel>()

    form$.find('name')
    expectTypeOf(form$.get('city')).toExtend<TextModel>()
    form$.set('name', 'John')
    form$.update({ name: 'John' })
  })

  test('formReady: callback form and promise form', () => {
    formReady((ready$) => {
      expectTypeOf(ready$.model).toExtend<FormModel>()
    })
    expectTypeOf(formReady()).toExtend<Promise<typeof form$>>()
  })

  test('model argument matrix', () => {
    useForm({ schema: { name: { type: 'text' } } }, { name: 'John' })
    useForm({ schema: { name: { type: 'text' } } }, ref({ name: 'John' }))
    useForm({ schema: { name: { type: 'text' } } }, ref<Record<string, any> | undefined>(undefined))
    useForm({ schema: { name: { type: 'text' } } }, reactive({ name: 'John' }))
    useForm({ schema: { name: { type: 'text' } } }, useModel({ name: { type: 'text' } }))
    useForm({ schema: { name: { type: 'text' } } }, { extra: 'accepted' })
  })

  test('event handlers (`onSubmit`, …) are contextually typed from VfFormEmits', () => {
    useForm({
      schema: { name: { type: 'text' } },
      onSubmit: (payload, context$) => {
        expectTypeOf(payload).toEqualTypeOf<FormData | Record<string, any>>()
        expectTypeOf(context$).not.toBeAny()
        expectTypeOf(context$.get('name')).toExtend<TextModel>()
      },
    })
  })

  test('annotating `context$` must not strip contextual typing from `payload`', () => {
    useForm({
      schema: { name: { type: 'text' } },
      onSubmit: (payload, _context$: FormContext) => {
        expectTypeOf(payload).toEqualTypeOf<FormData | Record<string, any>>()
      },
    })
  })

  test('extra attrs still match the typed overload (catch-all is `unknown`, not `any`)', () => {
    useForm({ schema: { name: { type: 'text' } }, id: 'register' })
  })

  test('wide usage without a concrete schema stays loose', () => {
    const [, _wideForm$] = useForm()
    expectTypeOf(_wideForm$.model).toEqualTypeOf<Record<string, any>>()
  })
})
