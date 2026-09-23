import { expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { makeApp, mountApp } from '../../helpers'

export default async (Case: any, template: string) => {
  const formHasVModel = Case.hasOwnProperty('formVModel')
  const listHasVModel = Case.hasOwnProperty('listVModel')

  const onChangeForm = vi.fn()
  const onChangeList = vi.fn()
  const onChangeSublist = vi.fn()
  const onChangeText = vi.fn()

  const App = makeApp(template, ['list', 'sublist', 'text'])

  const app = mountApp(App, {
    props: {
      form: Case.formVModel,
      list: Case.listVModel,
      'onUpdate:form': (v: any) => app.setProps({ form: v }),
      'onUpdate:list': (v: any) => app.setProps({ list: v }),
      onChangeForm,
      onChangeList,
      onChangeSublist,
      onChangeText,
    },
  })

  const form = app.findComponent({ name: 'VfForm' })

  const list = form.findAllComponents({ name: 'VfList' })[0]

  const sublists = list.findAllComponents({ name: 'VfList' })
  const sublist = sublists[0]

  const texts = form.findAllComponents({ name: 'VfText' })
  const text = texts[0]

  const listData = (data: any) => {
    return data.list
  }

  const updateFormModelValue = (value: any) => {
    app.setProps({ form: value })
  }

  const updateListModelValue = (value: any) => {
    app.setProps({ list: value })
  }

  const expectAllToEqual = async (data: any, instant = false) => {
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

    listData(data).forEach((listData: any, i: number) => {
      const currentList = list.findAllComponents({ name: 'VfList' })[i]

      expect(currentList.vm.model).toEqual(listData)

      if (listData.length) {
        expect(
          currentList.findAllComponents({ name: 'VfText' })[0].vm.model
        ).toEqual(listData[0])
      }
    })
  }

  const expectAllInitialToEqual = async (data: any) => {
    expect(form.vm.initialModel).toEqual(data)
    expect(list.vm.initialModel).toEqual(listData(data))

    listData(data).forEach((listData: any, i: number) => {
      const currentList = list.findAllComponents({ name: 'VfList' })[i]

      expect(currentList.vm.model).toEqual(listData)

      if (listData.length) {
        expect(
          currentList.findAllComponents({ name: 'VfText' })[0].vm.model
        ).toEqual(listData[0])
      }
    })
  }

  const expectAllToBeCalledTimesWith = async (times: number, data: any) => {
    await nextTick()

    expect(onChangeForm).toHaveBeenCalledTimes(times)
    expect(onChangeList).toHaveBeenCalledTimes(times)

    if (times) {
      expect(onChangeForm.mock.calls[times - 1][0]).toEqual(data)
      expect(onChangeList.mock.calls[times - 1][0]).toEqual(listData(data))
      // expect(onChangeContainer.mock.calls[times-1][0]).toEqual(containerData(data))
      // expect(onChangeText.mock.calls[times-1][0]).toEqual(textData(data))
    } else {
      expect(onChangeSublist).toHaveBeenCalledTimes(times)
      expect(onChangeText).toHaveBeenCalledTimes(times)
    }
  }

  return {
    form,
    list,
    sublist,
    text,
    updateFormModelValue,
    updateListModelValue,
    expectAllToEqual,
    expectAllInitialToEqual,
    expectAllToBeCalledTimesWith,
  }
}
