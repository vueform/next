import { upperFirst } from '@vueform/core'
import { describe, it } from 'vitest'
import { nextTick } from 'vue'

// Shared per-case state — shapes vary per template, hence `any`.
let vms: any
let methods: any

let text: any
let expectAllToEqual: (data: any, instant?: boolean) => any
let expectAllInitialToEqual: (data: any) => any
let expectAllToBeCalledTimesWith: (times: number, data?: any) => any

const structures = [
  'form',
  'list',
  'listContainer',
  'sublist',
  'sublistContainer',
  'container',
  'subcontainer',
  'text',
]
const lists = ['list', 'sublist']
const vmodels = ['form', 'list', 'container', 'subcontainer', 'text']

export default (
  name: string,
  cases: any[],
  template: string,
  makeCase: (params: any, template: string) => Promise<any>
) =>
  describe('Data Handling', () => {
    describe(name, () => {
      cases.forEach((Case: any) => {
        describe(Case.suite, async () => {
          const { initial, update, clear } = Case.params

          beforeEach(async () => {
            const CASE = await makeCase(Case.params, template)

            vms = CASE
            text = CASE.text
            methods = CASE

            expectAllToEqual = CASE.expectAllToEqual
            expectAllInitialToEqual = CASE.expectAllInitialToEqual
            expectAllToBeCalledTimesWith = CASE.expectAllToBeCalledTimesWith
          })

          // Init
          it(`should have the right initial value`, async () => {
            await expectAllInitialToEqual(initial)
            await expectAllToEqual(initial, true)
          })

          it(`should not emit change event by default`, async () => {
            await expectAllToBeCalledTimesWith(0)
          })

          structures.forEach((s) => {
            if (Case.params.update?.[s]) {
              // Internal update
              it(`should update internal/external data on updating ${s.toUpperCase()}`, async () => {
                vms[s].vm.update(update[s][0])
                await expectAllToEqual(update[s][1])
              })

              // Change event
              it(`should emit change event on updating ${s.toUpperCase()}`, async () => {
                vms[s].vm.update(update[s][0])
                await expectAllToBeCalledTimesWith(1, update[s][1])
              })

              if (Case.params.clear?.[s]) {
                // Reset
                it(`should reset ${s.toUpperCase()}`, async () => {
                  vms[s].vm.clear()
                  await expectAllToEqual(clear[s])

                  await nextTick()
                  vms[s].vm.reset()
                  await expectAllToEqual(initial)
                })

                // Clear
                it(`should clear ${s.toUpperCase()}`, async () => {
                  vms[s].vm.clear()
                  await expectAllToEqual(clear[s])
                })
              }
            }
          })

          // External update
          vmodels.forEach((v) => {
            if (Case.params[`${v}VModel`] && Case.params.update?.[v]) {
              it(`should update internal data on updating external ${v.toUpperCase()}`, async () => {
                methods[`update${upperFirst(v)}ModelValue`](
                  update[`${v}VModel`][0]
                )
                await nextTick()
                await expectAllToEqual(update[`${v}VModel`][1])
              })

              it(`should emit change event on updating external ${v.toUpperCase()}`, async () => {
                methods[`update${upperFirst(v)}ModelValue`](
                  update[`${v}VModel`][0]
                )
                await nextTick()
                await expectAllToBeCalledTimesWith(1, update[`${v}VModel`][1])
              })
            }
          })

          lists.forEach((l) => {
            if (Case.params.add?.[l]) {
              // Adding
              it(`should update internal/external data on add to ${l.toUpperCase()}`, async () => {
                vms[l].vm.add()
                await nextTick()
                await expectAllToEqual(Case.params.add[l])
              })

              it(`should emit change event on add to ${l.toUpperCase()}`, async () => {
                vms[l].vm.add()
                await nextTick()
                await expectAllToBeCalledTimesWith(1, Case.params.add[l])
              })

              // Removing
              it(`should update internal/external data on remove from ${l.toUpperCase()}`, async () => {
                vms[l].vm.add()
                await nextTick()
                await expectAllToEqual(Case.params.add[l])

                vms[l].vm.remove()
                await expectAllToEqual(initial)
              })

              it(`should emit change event on remove to ${l.toUpperCase()}`, async () => {
                vms[l].vm.add()
                await nextTick()

                vms[l].vm.remove()
                await nextTick()
                await expectAllToBeCalledTimesWith(2, initial)
              })
            }
          })

          it(`should update internal/external data on updating input`, async () => {
            text.find('input').setValue(update.text[0])
            expectAllToEqual(update.text[1])
          })

          it(`should emit change event on updating input`, async () => {
            const input = text.find('input')
            input.element.value = update.text[0]
            input.trigger('input')
            await expectAllToBeCalledTimesWith(1, update.text[1])
          })
        })
      })
    })
  })
