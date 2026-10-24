import { createVueform, definePlugin, model } from '@vueform/core'
import * as components from '@vueform/core/components'
import { describe, expect, it } from 'vitest'

const { VfText, VfTextarea } = components as any

describe('Plugin props/emits never mutate the shared component definitions', () => {
  const propsBefore = Object.keys(VfText.props ?? {})
  const emitsBefore = [...(VfText.emits ?? [])]
  const textareaPropsBefore = Object.keys(VfTextarea.props ?? {})

  it('leaves the imported definition untouched when a plugin targets it', () => {
    const vueform = createVueform({
      modules: { model },
      components,
      plugins: [
        definePlugin(() => ({
          apply: 'VfText',
          props: { pluginProp: { type: String } },
          emits: ['pluginEvent'],
          plugins: [
            { apply: 'VfText', props: { nestedProp: { type: Number } } },
            { apply: '*element', emits: ['nestedEvent'] },
          ],
        }))(),
      ],
    } as any)

    // The instance sees the extensions...
    const instanceText = vueform.config.components.VfText as any
    expect(Object.keys(instanceText.props)).toEqual(
      expect.arrayContaining(['pluginProp', 'nestedProp'])
    )
    expect(instanceText.emits).toEqual(
      expect.arrayContaining(['pluginEvent', 'nestedEvent'])
    )
    expect(instanceText).not.toBe(VfText)

    // ...the shared module objects do not.
    expect(Object.keys(VfText.props ?? {})).toEqual(propsBefore)
    expect([...(VfText.emits ?? [])]).toEqual(emitsBefore)
    expect(Object.keys(VfTextarea.props ?? {})).toEqual(textareaPropsBefore)
    expect((VfTextarea.emits ?? []).includes('nestedEvent')).toBe(false)
  })

  it("does not leak one instance's extensions into another", () => {
    const a = createVueform({
      modules: { model },
      components,
      plugins: [
        definePlugin(() => ({
          apply: 'VfText',
          props: { onlyA: { type: String } },
        }))(),
      ],
    } as any)
    const b = createVueform({ modules: { model }, components } as any)

    expect((a.config.components.VfText as any).props.onlyA).toBeDefined()
    expect((b.config.components.VfText as any).props.onlyA).toBeUndefined()
    expect(b.config.components.VfText).toBe(VfText)
  })
})
