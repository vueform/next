import { expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { makeApp, mountApp } from '../../helpers'

export default async (Case, template) => {
  const formHasVModel = Case.hasOwnProperty('formVModel')
  const listHasVModel = Case.hasOwnProperty('listVModel')

  const onChangeForm = vi.fn()
  const onChangeList = vi.fn()
  const onChangeListContainer = vi.fn()
  const onChangeSublist = vi.fn()
  const onChangeSublistContainer = vi.fn()
  const onChangeText = vi.fn()

  const App = makeApp(template, [
    'list',
    'listContainer',
    'sublist',
    'sublistContainer',
    'text',
  ])

  const app = mountApp(App, {
    props: {
      form: Case.formVModel,
      list: Case.listVModel,
      'onUpdate:form': (v) => app.setProps({ form: v }),
      'onUpdate:list': (v) => app.setProps({ list: v }),
      onChangeForm,
      onChangeList,
      onChangeListContainer,
      onChangeSublist,
      onChangeSublistContainer,
      onChangeText,
    },
  })

  const form = app.findComponent({ name: 'VfForm' })

  const list = form.findAllComponents({ name: 'VfList' })[0]

  const listContainers = list
    .findAllComponents({ name: 'VfGroup' })
    .filter((c) => c.vm.path.split('.').length === 2)
  const listContainer = listContainers[0]

  const sublists = list.findAllComponents({ name: 'VfList' })
  const sublist = sublists[0]

  const sublistContainers = list
    .findAllComponents({ name: 'VfGroup' })
    .filter((c) => c.vm.path.split('.').length === 4)
  const sublistContainer = sublistContainers[0]

  const texts = form
    .findAllComponents({ name: 'VfText' })
    .filter((c) => c.vm.name === 'text')
  const text = texts[0]

  const listData = (data) => {
    return data.list
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

    // listData(data).forEach((listData, i) => {
    //   const currentList = list.findAllComponents({ name: 'VfList' })[i]

    //   expect(currentList.vm.model).toEqual(listData)

    //   if (listData.length) {
    //     expect(currentList.findAllComponents({ name: 'VfText' })[0].vm.model).toEqual(listData[0])
    //   }
    // })
  }

  const expectAllInitialToEqual = async (data) => {
    expect(form.vm.initialModel).toEqual(data)
    expect(list.vm.initialModel).toEqual(listData(data))

    // listData(data).forEach((listData, i) => {
    //   const currentList = list.findAllComponents({ name: 'VfList' })[i]

    //   expect(currentList.vm.model).toEqual(listData)

    //   if (listData.length) {
    //     expect(currentList.findAllComponents({ name: 'VfText' })[0].vm.model).toEqual(listData[0])
    //   }
    // })
  }

  const expectAllToBeCalledTimesWith = async (times, data) => {
    await nextTick()

    expect(onChangeForm).toHaveBeenCalledTimes(times)
    expect(onChangeList).toHaveBeenCalledTimes(times)

    if (times) {
      expect(onChangeForm.mock.calls[times - 1][0]).toEqual(data)
      expect(onChangeList.mock.calls[times - 1][0]).toEqual(listData(data))
    } else {
      expect(onChangeListContainer).toHaveBeenCalledTimes(times)
      expect(onChangeSublist).toHaveBeenCalledTimes(times)
      expect(onChangeSublistContainer).toHaveBeenCalledTimes(times)
      expect(onChangeText).toHaveBeenCalledTimes(times)
    }
  }

  return {
    form,
    list,
    listContainer,
    sublist,
    sublistContainer,
    text,
    updateFormModelValue,
    updateListModelValue,
    expectAllToEqual,
    expectAllInitialToEqual,
    expectAllToBeCalledTimesWith,
  }
}
