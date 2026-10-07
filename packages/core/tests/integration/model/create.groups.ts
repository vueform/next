import { get } from '@vueform/core'
import { expect, vi } from 'vitest'
import { nextTick } from 'vue'

import { makeApp, mountApp } from '../../helpers'

export default async (Case: any, template: string) => {
  const formHasVModel = Case.hasOwnProperty('formVModel')
  const containerHasVModel = Case.hasOwnProperty('containerVModel')
  const subcontainerHasVModel = Case.hasOwnProperty('subcontainerVModel')
  const textHasVModel = Case.hasOwnProperty('textVModel')

  const onChangeForm = vi.fn()
  const onChangeContainer = vi.fn()
  const onChangeSubcontainer = vi.fn()
  const onChangeText = vi.fn()

  const App = makeApp(template, ['container', 'subcontainer', 'text'])

  const app = mountApp(App, {
    props: {
      form: Case.formVModel,
      container: Case.containerVModel,
      subcontainer: Case.subcontainerVModel,
      text: Case.textVModel,
      'onUpdate:form': (v: any) => app.setProps({ form: v }),
      'onUpdate:container': (v: any) => app.setProps({ container: v }),
      'onUpdate:subcontainer': (v: any) => app.setProps({ subcontainer: v }),
      'onUpdate:text': (v: any) => app.setProps({ text: v }),
      onChangeForm,
      onChangeContainer,
      onChangeSubcontainer,
      onChangeText,
    },
  })

  await nextTick()

  const form = app.findComponent({ name: 'VfForm' })
  const containerNested = !!form.vm.elements$.get('container').props.nested
  const subcontainerNested = !!form.vm.elements$
    .get('container')
    .children.children$.get('subcontainer').props.nested
  const container = form.findAllComponents({ name: 'VfGroup' })[0]
  const subcontainer = form
    .findAllComponents({ name: 'VfGroup' })
    .find((c) => c.vm.name === 'subcontainer')!
  const text = form.findAllComponents({ name: 'VfText' })[0]

  const containerData = (data: any) => {
    let containerData = get(data, container.vm.dataPath)

    if (!container.vm.nested) {
      containerData = Object.fromEntries(
        Object.entries(data).filter(([key]) =>
          container.vm.childKeys.includes(key)
        )
      )
    }

    return containerData
  }

  const subcontainerData = (data: any) => {
    let subcontainerData = get(data, subcontainer.vm.dataPath)

    if (!subcontainerNested) {
      subcontainerData = Object.fromEntries(
        Object.entries(
          !container.vm.props.nested ? data : data.container
        ).filter(([key]) => subcontainer.vm.childKeys?.includes(key))
      )
    }

    return subcontainerData
  }

  const textData = (data: any) => {
    return get(data, text.vm.dataPath)
  }

  const updateFormModelValue = (value: any) => {
    app.setProps({ form: value })
  }

  const updateContainerModelValue = (value: any) => {
    app.setProps({ container: value })
  }

  const updateSubcontainerModelValue = (value: any) => {
    app.setProps({ subcontainer: value })
  }

  const updateTextModelValue = (value: any) => {
    app.setProps({ text: value })
  }

  const expectAllToEqual = async (data: any, instant = false) => {
    expect(form.vm.model).toEqual(data)
    if (containerNested) expect(container.vm.model).toEqual(containerData(data))
    if (subcontainerNested)
      expect(subcontainer.vm.model).toEqual(subcontainerData(data))
    expect(text.vm.model).toEqual(textData(data))

    if (
      formHasVModel ||
      containerHasVModel ||
      subcontainerHasVModel ||
      textHasVModel
    ) {
      if (!instant) {
        await nextTick()
      }

      if (formHasVModel) {
        expect(app.vm.form).toEqual(data)
      }
      if (containerHasVModel) {
        expect(app.vm.container).toEqual(containerData(data))
      }

      if (subcontainerHasVModel) {
        expect(app.vm.subcontainer).toEqual(subcontainerData(data))
      }

      if (textHasVModel) {
        expect(app.vm.text).toEqual(textData(data))
      }
    }
  }

  const expectAllInitialToEqual = async (data: any) => {
    expect(form.vm.initialModel).toEqual(data)
    if (containerNested)
      expect(container.vm.initialModel).toEqual(containerData(data))
    if (subcontainerNested)
      expect(subcontainer.vm.initialModel).toEqual(subcontainerData(data))
    expect(text.vm.initialModel).toEqual(textData(data))
  }

  const expectAllToBeCalledTimesWith = async (times: number, data: any) => {
    await nextTick()

    expect(onChangeForm).toHaveBeenCalledTimes(times)
    if (containerNested) expect(onChangeContainer).toHaveBeenCalledTimes(times)
    if (subcontainerNested)
      expect(onChangeSubcontainer).toHaveBeenCalledTimes(times)
    expect(onChangeText).toHaveBeenCalledTimes(times)

    if (times) {
      expect(onChangeForm.mock.calls[times - 1][0]).toEqual(data)
      if (containerNested)
        expect(onChangeContainer.mock.calls[times - 1][0]).toEqual(
          containerData(data)
        )
      if (subcontainerNested)
        expect(onChangeSubcontainer.mock.calls[times - 1][0]).toEqual(
          subcontainerData(data)
        )
      expect(onChangeText.mock.calls[times - 1][0]).toEqual(textData(data))
    }
  }

  return {
    form,
    container,
    subcontainer,
    text,
    updateFormModelValue,
    updateContainerModelValue,
    updateSubcontainerModelValue,
    updateTextModelValue,
    expectAllToEqual,
    expectAllInitialToEqual,
    expectAllToBeCalledTimesWith,
  }
}
