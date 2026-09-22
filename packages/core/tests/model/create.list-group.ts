import { get } from '@vueform/core'
import { expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { makeApp, mountApp } from '../helpers'

export default async (Case, template) => {
  const formHasVModel = Case.hasOwnProperty('formVModel')
  const listHasVModel = Case.hasOwnProperty('listVModel')

  const onChangeForm = vi.fn()
  const onChangeList = vi.fn()

  const App = makeApp(template, ['list'])

  const app = mountApp(App, {
    props: {
      form: Case.formVModel,
      list: Case.listVModel,
      'onUpdate:form': (v) => app.setProps({ form: v }),
      'onUpdate:list': (v) => app.setProps({ list: v }),
      onChangeForm,
      onChangeList,
    },
  })

  const form = app.findComponent({ name: 'VfForm' })

  const list = form.findAllComponents({ name: 'VfList' })[0]
  let containers = form.findAllComponents({ name: 'VfGroup' })
  let container = containers[0]
  let texts = list.findAllComponents({ name: 'VfText' })
  const text = texts[0]

  const listData = (data) => {
    return data.list
  }

  const textData = (data, index = 0) => {
    return get(
      data,
      list
        .findAllComponents({ name: 'VfText' })
        .filter((c) => c.vm.name === 'text')[index].vm.dataPath
    )
  }

  const updateFormModelValue = (value) => {
    app.setProps({ form: value })
  }

  const updateListModelValue = (value) => {
    app.setProps({ list: value })
  }

  const expectAllToEqual = async (data, instant = false) => {
    expect(form.vm.model).toEqual(data)
    expect(list.vm.model).toEqual(listData(data))

    if (formHasVModel || listHasVModel) {
      if (!instant) {
        await nextTick()
      }

      if (formHasVModel) {
        expect(app.vm.form).toEqual(data)
      }

      if (listHasVModel) {
        expect(app.vm.list).toEqual(listData(data))
      }
    }

    await nextTick()

    listData(data).forEach((objectData, i) => {
      expect(list.findAllComponents({ name: 'VfGroup' })[i].vm.model).toEqual(
        objectData
      )
      expect(
        list
          .findAllComponents({ name: 'VfText' })
          .filter((c) => c.vm.name === 'text')[i].vm.model
      ).toEqual(textData(data, i))
    })
  }

  const expectAllInitialToEqual = async (data) => {
    expect(form.vm.initialModel).toEqual(data)
    expect(list.vm.initialModel).toEqual(listData(data))

    listData(data).forEach((objectData, i) => {
      expect(
        list.findAllComponents({ name: 'VfGroup' })[i].vm.initialModel
      ).toEqual(objectData)
      expect(
        list
          .findAllComponents({ name: 'VfText' })
          .filter((c) => c.vm.name === 'text')[i].vm.initialModel
      ).toEqual(textData(data, i))
    })
  }

  const expectAllToBeCalledTimesWith = async (times, data) => {
    await nextTick()

    expect(onChangeForm).toHaveBeenCalledTimes(times)
    expect(onChangeList).toHaveBeenCalledTimes(times)
    // expect(onChangeContainer).toHaveBeenCalledTimes(times)
    // expect(onChangeText).toHaveBeenCalledTimes(times)

    if (times) {
      expect(onChangeForm.mock.calls[times - 1][0]).toEqual(data)
      expect(onChangeList.mock.calls[times - 1][0]).toEqual(listData(data))
      // expect(onChangeContainer.mock.calls[times-1][0]).toEqual(containerData(data))
      // expect(onChangeText.mock.calls[times-1][0]).toEqual(textData(data))
    }
  }

  return {
    form,
    container,
    list,
    text,
    updateFormModelValue,
    updateListModelValue,
    expectAllToEqual,
    expectAllInitialToEqual,
    expectAllToBeCalledTimesWith,
  }
}
