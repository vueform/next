import { get } from '@vueform/core'
import { expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { makeApp, mountApp } from '../helpers'

export default async (Case, template) => {
  const formHasVModel = Case.hasOwnProperty('formVModel')
  const containerHasVModel = Case.hasOwnProperty('containerVModel')
  const listHasVModel = Case.hasOwnProperty('listVModel')

  const onChangeForm = vi.fn()
  const onChangeContainer = vi.fn()
  const onChangeList = vi.fn()

  const App = makeApp(template, ['container', 'list'])

  const app = mountApp(App, {
    props: {
      form: Case.formVModel,
      container: Case.containerVModel,
      list: Case.listVModel,
      'onUpdate:form': (v) => app.setProps({ form: v }),
      'onUpdate:container': (v) => app.setProps({ container: v }),
      'onUpdate:list': (v) => app.setProps({ list: v }),
      onChangeForm,
      onChangeContainer,
      onChangeList,
    },
  })

  const form = app.findComponent({ name: 'VfForm' })

  const containerNested = !!form.vm.elements$.get('container').props.nested
  const container = form.findAllComponents({ name: 'VfGroup' })[0]
  const list = form.findAllComponents({ name: 'VfList' })[0]
  const texts = list.findAllComponents({ name: 'VfText' })
  const text = texts[0]

  const containerData = (data) => {
    return get(data, container.vm.dataPath)
  }

  const listData = (data) => {
    return get(data, list.vm.dataPath)
  }

  const updateFormModelValue = (value) => {
    app.setProps({ form: value })
  }

  const updateContainerModelValue = (value) => {
    app.setProps({ container: value })
  }

  const updateListModelValue = (value) => {
    app.setProps({ list: value })
  }

  const updateTextModelValue = (value) => {
    app.setProps({ text: value })
  }

  const expectAllToEqual = async (data, instant = false) => {
    expect(form.vm.model).toEqual(data)
    if (containerNested) expect(container.vm.model).toEqual(containerData(data))
    expect(list.vm.model).toEqual(listData(data))

    if (formHasVModel || containerHasVModel || listHasVModel) {
      if (!instant) {
        await nextTick()
      }

      if (formHasVModel) {
        expect(app.vm.form).toEqual(data)
      }

      if (containerHasVModel) {
        expect(app.vm.container).toEqual(containerData(data))
      }

      if (listHasVModel) {
        expect(app.vm.list).toEqual(listData(data))
      }
    }

    await nextTick()

    listData(data).forEach((textData, i) => {
      expect(list.findAllComponents({ name: 'VfText' })[i].vm.model).toEqual(
        textData
      )
    })
  }

  const expectAllInitialToEqual = async (data) => {
    expect(form.vm.initialModel).toEqual(data)
    if (containerNested)
      expect(container.vm.initialModel).toEqual(containerData(data))
    expect(list.vm.initialModel).toEqual(listData(data))

    listData(data).forEach((textData, i) => {
      expect(
        list.findAllComponents({ name: 'VfText' })[i].vm.initialModel
      ).toEqual(textData)
    })
  }

  const expectAllToBeCalledTimesWith = async (times, data) => {
    await nextTick()

    expect(onChangeForm).toHaveBeenCalledTimes(times)
    if (containerNested) expect(onChangeContainer).toHaveBeenCalledTimes(times)
    expect(onChangeList).toHaveBeenCalledTimes(times)

    if (times) {
      expect(onChangeForm.mock.calls[times - 1][0]).toEqual(data)
      if (containerNested)
        expect(onChangeContainer.mock.calls[times - 1][0]).toEqual(
          containerData(data)
        )
      expect(onChangeList.mock.calls[times - 1][0]).toEqual(listData(data))
    }
  }

  return {
    form,
    container,
    list,
    text,
    updateFormModelValue,
    updateContainerModelValue,
    updateListModelValue,
    updateTextModelValue,
    expectAllToEqual,
    expectAllInitialToEqual,
    expectAllToBeCalledTimesWith,
  }
}
