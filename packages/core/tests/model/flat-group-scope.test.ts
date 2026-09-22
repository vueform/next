import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { el, makeApp, mountApp, vModelAndChange } from '../helpers'

const template = `
  <VfForm>
    <VfGroup name="container" @change="onChangeContainer">
      <VfText name="text" model-value="foo" />
      <VfGroup name="subcontainer" @change="onChangeSubcontainer">
        <VfText name="subtext" model-value="bar" />
      </VfGroup>
      <VfGroup nested name="nested">
        <VfText name="nested_text" model-value="baz" />
      </VfGroup>
    </VfGroup>
    <VfText name="sibling" model-value="qux" />
  </VfForm>
`

const createCase = () => {
  const onChangeContainer = vi.fn()
  const onChangeSubcontainer = vi.fn()

  const app = mountApp(makeApp(template, ['container', 'subcontainer']), {
    props: {
      onChangeContainer,
      onChangeSubcontainer,
    },
  })

  return {
    app,
    form: app.findComponent({ name: 'VfForm' }).vm,
    container: el(app, 'container'),
    subcontainer: el(app, 'container.subcontainer'),
    text: el(app, 'container.text'),
    subtext: el(app, 'container.subcontainer.subtext'),
    sibling: el(app, 'sibling'),
    onChangeContainer,
    onChangeSubcontainer,
  }
}

describe('Data Handling', () => {
  describe('Flat group model scoping', () => {
    it('should scope model to own children, recursing into flat children', async () => {
      const { form, container, subcontainer } = createCase()

      expect(form.model).toEqual({
        text: 'foo',
        subtext: 'bar',
        nested: { nested_text: 'baz' },
        sibling: 'qux',
      })

      expect(container.model).toEqual({
        text: 'foo',
        subtext: 'bar',
        nested: { nested_text: 'baz' },
      })

      expect(subcontainer.model).toEqual({ subtext: 'bar' })
    })

    it('should scope initialModel and not be dirty initially', async () => {
      const { container, subcontainer } = createCase()

      expect(container.initialModel).toEqual({
        text: 'foo',
        subtext: 'bar',
        nested: { nested_text: 'baz' },
      })
      expect(subcontainer.initialModel).toEqual({ subtext: 'bar' })

      expect(container.dirty).toBe(false)
      expect(subcontainer.dirty).toBe(false)
    })

    it('should become dirty on own child change but not on sibling change', async () => {
      const { container, subcontainer, text, sibling } = createCase()

      sibling.update('changed')
      await nextTick()

      expect(container.dirty).toBe(false)
      expect(subcontainer.dirty).toBe(false)

      text.update('changed')
      await nextTick()

      expect(container.dirty).toBe(true)
      expect(subcontainer.dirty).toBe(false)
    })

    it('should emit change with scoped values on own child change', async () => {
      const { text, onChangeContainer, onChangeSubcontainer } = createCase()

      text.update('changed')
      await nextTick()
      await nextTick()

      expect(onChangeContainer).toHaveBeenCalledTimes(1)
      expect(onChangeContainer.mock.calls[0][0]).toEqual({
        text: 'changed',
        subtext: 'bar',
        nested: { nested_text: 'baz' },
      })
      expect(onChangeContainer.mock.calls[0][1]).toEqual({
        text: 'foo',
        subtext: 'bar',
        nested: { nested_text: 'baz' },
      })

      expect(onChangeSubcontainer).toHaveBeenCalledTimes(0)
    })

    it('should emit change on flat and nested descendant changes', async () => {
      const { subtext, onChangeContainer, onChangeSubcontainer, ...rest } =
        createCase()

      subtext.update('changed')
      await nextTick()
      await nextTick()

      expect(onChangeContainer).toHaveBeenCalledTimes(1)
      expect(onChangeSubcontainer).toHaveBeenCalledTimes(1)
      expect(onChangeSubcontainer.mock.calls[0][0]).toEqual({
        subtext: 'changed',
      })
      expect(onChangeSubcontainer.mock.calls[0][1]).toEqual({ subtext: 'bar' })

      const nestedText = el(rest.app, 'container.nested.nested_text')
      nestedText.update('changed')
      await nextTick()
      await nextTick()

      expect(onChangeContainer).toHaveBeenCalledTimes(2)
      expect(onChangeContainer.mock.calls[1][0]).toEqual({
        text: 'foo',
        subtext: 'changed',
        nested: { nested_text: 'changed' },
      })
      expect(onChangeSubcontainer).toHaveBeenCalledTimes(1)
    })

    it('should not emit change on same-level sibling change', async () => {
      const { sibling, onChangeContainer, onChangeSubcontainer } = createCase()

      sibling.update('changed')
      await nextTick()
      await nextTick()

      expect(onChangeContainer).toHaveBeenCalledTimes(0)
      expect(onChangeSubcontainer).toHaveBeenCalledTimes(0)
    })

    it('should drop sibling keys on update instead of writing them', async () => {
      const { form, container } = createCase()

      container.update({ text: 'changed', sibling: 'leak' })
      await nextTick()

      expect(form.model).toEqual({
        text: 'changed',
        subtext: 'bar',
        nested: { nested_text: 'baz' },
        sibling: 'qux',
      })
    })

    it('should clear and reset only own children', async () => {
      const { form, container } = createCase()

      container.clear()
      await nextTick()

      expect(form.model).toEqual({
        text: null,
        subtext: null,
        nested: { nested_text: null },
        sibling: 'qux',
      })

      container.reset()
      await nextTick()

      expect(form.model).toEqual({
        text: 'foo',
        subtext: 'bar',
        nested: { nested_text: 'baz' },
        sibling: 'qux',
      })
    })
  })

  describe('Flat group v-model', () => {
    const vModelTemplate = `
      <VfForm>
        <VfGroup name="container" ${vModelAndChange('container')}>
          <VfText name="text" model-value="foo" />
          <VfText name="other" model-value="bar" />
        </VfGroup>
        <VfText name="sibling" model-value="qux" />
      </VfForm>
    `

    const createVModelCase = (initial?: Record<string, any>) => {
      const onChangeContainer = vi.fn()

      const app = mountApp(makeApp(vModelTemplate, ['container']), {
        props: {
          container: initial,
          'onUpdate:container': (v: any) => app.setProps({ container: v }),
          onChangeContainer,
        },
      })

      return {
        app,
        form: app.findComponent({ name: 'VfForm' }).vm,
        container: el(app, 'container'),
        text: el(app, 'container.text'),
        sibling: el(app, 'sibling'),
        onChangeContainer,
      }
    }

    it('should seed children from the initial v-model without firing change', async () => {
      const { app, form, container, onChangeContainer } = createVModelCase({
        text: 'seeded',
      })

      expect(form.model).toEqual({
        text: 'seeded',
        other: 'bar',
        sibling: 'qux',
      })
      expect(container.model).toEqual({ text: 'seeded', other: 'bar' })
      expect(container.dirty).toBe(false)

      await nextTick()
      await nextTick()

      expect(app.vm.container).toEqual({ text: 'seeded', other: 'bar' })
      expect(onChangeContainer).toHaveBeenCalledTimes(0)
    })

    it('should emit update:modelValue with the scoped value on child change', async () => {
      const { app, text, onChangeContainer } = createVModelCase({
        text: 'foo',
        other: 'bar',
      })

      text.update('changed')
      await nextTick()
      await nextTick()

      expect(app.vm.container).toEqual({ text: 'changed', other: 'bar' })
      expect(onChangeContainer).toHaveBeenCalledTimes(1)
      expect(onChangeContainer.mock.calls[0][0]).toEqual({
        text: 'changed',
        other: 'bar',
      })
    })

    it('should apply external v-model updates to children and drop unknown keys', async () => {
      const { app, form } = createVModelCase({ text: 'foo', other: 'bar' })

      await app.setProps({
        container: { text: 'external', other: 'bar', sibling: 'leak' },
      })
      await nextTick()

      expect(form.model).toEqual({
        text: 'external',
        other: 'bar',
        sibling: 'qux',
      })
    })

    it('should not sync sibling changes into the v-model', async () => {
      const { app, sibling, onChangeContainer } = createVModelCase({
        text: 'foo',
        other: 'bar',
      })

      sibling.update('changed')
      await nextTick()
      await nextTick()

      expect(app.vm.container).toEqual({ text: 'foo', other: 'bar' })
      expect(onChangeContainer).toHaveBeenCalledTimes(0)
    })
  })
})
