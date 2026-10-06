import { computed, nextTick, unref, ref, type Ref } from 'vue'

import { defineSchema } from '#core'

import { createForm, makeApp, mountApp, vModelAndChange } from '../../helpers'

const staticSchema = {
  cols: [
    {
      value: 'col_1',
      label: 'Col 1',
    },
    {
      value: 'col_2',
      label: 'Col 2',
    },
  ],
  rows: [
    {
      value: 'row_1',
      label: 'Row 1',
    },
    {
      value: 'row_2',
      label: 'Row 2',
    },
  ],
}

const checkModelsOf = (
  matrixSchema: any,
  data: any,
  form$: any,
  mode: string = 'auto',
  model: string = 'model'
) => {
  const cols = matrixSchema.cols.map(({ value }: { value: string }) => value)
  const rows = Object.keys(data.matrix)

  expect(form$.model).toEqual(data)
  expect(form$.find('matrix')[model]).toEqual(data.matrix)

  rows.forEach((row) => {
    expect(form$.find(`matrix.${row}`)[model]).toEqual(data.matrix[row])
    if (mode !== 'auto') return
    cols.forEach((col: string) =>
      expect(form$.find(`matrix.${row}.${col}`)[model]).toEqual(
        data.matrix[row][col]
      )
    )
  })
}

const checkEmitsOf = async (
  callback: ReturnType<typeof vi.fn>,
  count: number,
  newData?: any,
  oldData?: any
) => {
  await nextTick()

  if (!count) {
    expect(callback).toHaveBeenCalledTimes(count)
    return
  }

  expect(callback.mock.calls[count - 1].slice(0, 2)).toEqual([newData, oldData])
}

// Shared per-suite state — the vm shapes vary per mount, hence `any`.
let app: any
let form$: any
let mode: Ref<string>
let matrixSchema: any
let baseSchema: any
let createVModelForm: (models: any) => { form$: any; app: any }
let onChangeForm: ReturnType<typeof vi.fn>
let onChangeMatrix: ReturnType<typeof vi.fn>
let checkModels: (data: any, checkInitials?: boolean) => void
let checkEmits: (count: number, newData?: any, oldData?: any) => Promise<void>

describe('Data Handling', () => {
  beforeEach(() => {
    onChangeForm = vi.fn()
    onChangeMatrix = vi.fn()

    checkModels = (data: any, checkInitials = false) => {
      checkModelsOf(
        matrixSchema || unref(form$.schema).matrix,
        data,
        form$,
        unref(form$.schema)?.matrix?.mode || baseSchema.mode || 'auto'
      )
      if (!checkInitials) return
      checkModelsOf(
        matrixSchema || unref(form$.schema).matrix,
        data,
        form$,
        unref(form$.schema)?.matrix?.mode || baseSchema.mode || 'auto',
        'initialModel'
      )
    }

    checkEmits = async (count: any, newData?: any, oldData?: any) => {
      if (onChangeForm)
        await checkEmitsOf(onChangeForm, count, newData, oldData)
      if (onChangeMatrix)
        await checkEmitsOf(
          onChangeMatrix,
          count,
          newData?.matrix,
          oldData?.matrix
        )
    }
  })

  describe('<VfForm> / <VfMatrix>', () => {
    describe('NO v-model', () => {
      describe('CUSTOM mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,
          }
        })

        describe('BASE', () => {
          it('should have the right initial value', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            checkModels(
              {
                matrix: {
                  row_1: {
                    col_1: null,
                    col_2: null,
                  },
                  row_2: {
                    col_1: null,
                    col_2: null,
                  },
                },
              },
              true
            )
          })

          it('should not emit change event by default', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            await checkEmits(0)
          })
        })

        describe('FORM', () => {
          it('should update internal/external data on updating FORM', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            form$.update({
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 123,
                },
                row_2: {
                  col_2: 'bar',
                },
              },
            })

            checkModels({
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 123,
                },
                row_2: {
                  col_1: null,
                  col_2: 'bar',
                },
              },
            })
          })

          it('should emit change event on updating FORM', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.update({
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 123,
                },
                row_2: {
                  col_2: 'bar',
                },
              },
            })

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: {
                    col_1: 'foo',
                    col_2: 123,
                  },
                  row_2: {
                    col_1: null,
                    col_2: 'bar',
                  },
                },
              },
              {
                matrix: {
                  row_1: {
                    col_1: null,
                    col_2: null,
                  },
                  row_2: {
                    col_1: null,
                    col_2: null,
                  },
                },
              }
            )
          })

          it('should clear FORM', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: {
                      col_1: 'foo',
                      col_2: 123,
                    },
                    row_2: {
                      col_1: null,
                      col_2: 'bar',
                    },
                  },
                },
              }),
            }))

            form$.clear()

            checkModels({
              matrix: {
                row_1: {
                  col_1: null,
                  col_2: null,
                },
                row_2: {
                  col_1: null,
                  col_2: null,
                },
              },
            })
          })

          it('should reset FORM', async () => {
            const data = {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 123,
                },
                row_2: {
                  col_1: null,
                  col_2: 'bar',
                },
              },
            }

            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: data.matrix,
                },
              }),
            }))

            form$.clear()
            await nextTick()
            form$.reset()

            checkModels(data)
          })
        })

        describe('MATRIX', () => {
          it('should update internal/external data on updating MATRIX', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            form$.find('matrix').update({
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_2: 'bar',
              },
            })

            checkModels({
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 123,
                },
                row_2: {
                  col_1: null,
                  col_2: 'bar',
                },
              },
            })
          })

          it('should emit change event on updating MATRIX', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.find('matrix').update({
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_2: 'bar',
              },
            })

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: {
                    col_1: 'foo',
                    col_2: 123,
                  },
                  row_2: {
                    col_1: null,
                    col_2: 'bar',
                  },
                },
              },
              {
                matrix: {
                  row_1: {
                    col_1: null,
                    col_2: null,
                  },
                  row_2: {
                    col_1: null,
                    col_2: null,
                  },
                },
              }
            )
          })

          it('should clear MATRIX', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: {
                      col_1: 'foo',
                      col_2: 123,
                    },
                    row_2: {
                      col_1: null,
                      col_2: 'bar',
                    },
                  },
                },
              }),
            }))

            form$.find('matrix').clear()

            checkModels({
              matrix: {
                row_1: {
                  col_1: null,
                  col_2: null,
                },
                row_2: {
                  col_1: null,
                  col_2: null,
                },
              },
            })
          })

          it('should reset MATRIX', async () => {
            const data = {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 123,
                },
                row_2: {
                  col_1: null,
                  col_2: 'bar',
                },
              },
            }

            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: data.matrix,
                },
              }),
            }))

            form$.find('matrix').clear()
            await nextTick()
            form$.find('matrix').reset()

            checkModels(data)
          })
        })

        describe('INPUT', () => {
          it('should update internal/external data on updating INPUT', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            form$.find('matrix.row_1.col_1').update('foo')

            checkModels({
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: null,
                },
                row_2: {
                  col_1: null,
                  col_2: null,
                },
              },
            })
          })

          it('should emit change event on updating INPUT', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.find('matrix.row_1.col_1').update('foo')

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: {
                    col_1: 'foo',
                    col_2: null,
                  },
                  row_2: {
                    col_1: null,
                    col_2: null,
                  },
                },
              },
              {
                matrix: {
                  row_1: {
                    col_1: null,
                    col_2: null,
                  },
                  row_2: {
                    col_1: null,
                    col_2: null,
                  },
                },
              }
            )
          })
        })

        describe('DYNAMIC', () => {
          it('should update with dynamic rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,
                },
              }),
            }))

            checkModels({
              matrix: [
                {
                  col_1: null,
                  col_2: null,
                },
                {
                  col_1: null,
                  col_2: null,
                },
              ],
            })

            form$.find('matrix').update([
              {
                col_1: 'foo',
                col_2: null,
              },
            ])

            await nextTick()

            checkModels({
              matrix: [
                {
                  col_1: 'foo',
                  col_2: null,
                },
              ],
            })
          })

          it('should add rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,
                },
              }),
            }))

            checkModels({
              matrix: [
                {
                  col_1: null,
                  col_2: null,
                },
                {
                  col_1: null,
                  col_2: null,
                },
              ],
            })

            await form$.find('matrix').add()

            checkModels({
              matrix: [
                {
                  col_1: null,
                  col_2: null,
                },
                {
                  col_1: null,
                  col_2: null,
                },
                {
                  col_1: null,
                  col_2: null,
                },
              ],
            })
          })

          it('should remove rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,
                },
              }),
            }))

            checkModels({
              matrix: [
                {
                  col_1: null,
                  col_2: null,
                },
                {
                  col_1: null,
                  col_2: null,
                },
              ],
            })

            form$.find('matrix').update([
              {
                col_1: 'foo',
              },
              {
                col_2: 'bar',
              },
              {
                col_2: 'baz',
              },
              {},
            ])

            await nextTick()

            checkModels({
              matrix: [
                {
                  col_1: 'foo',
                },
                {
                  col_2: 'bar',
                },
                {
                  col_1: null,
                  col_2: 'baz',
                },
                {
                  col_1: null,
                  col_2: null,
                },
              ],
            })

            form$.find('matrix').remove(2)

            checkModels({
              matrix: [
                {
                  col_1: 'foo',
                },
                {
                  col_2: 'bar',
                },
                {
                  col_1: null,
                  col_2: null,
                },
              ],
            })
          })

          it('should switch to RADIO mode', async () => {
            const mode = ref('auto')

            ;({ form$ } = createForm({
              schema: computed(() =>
                defineSchema({
                  matrix: {
                    type: 'matrix',
                    ...staticSchema,
                    rows: 2,
                    mode: mode.value,
                  },
                })
              ),
            }))

            checkModels({
              matrix: [
                {
                  col_1: null,
                  col_2: null,
                },
                {
                  col_1: null,
                  col_2: null,
                },
              ],
            })

            mode.value = 'single'

            await nextTick()

            checkModels({
              matrix: [null, null],
            })
          })
        })
      })

      describe('RADIO mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,

            mode: 'single',
          }
        })

        describe('BASE', () => {
          it('should have the right initial value', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            checkModels(
              {
                matrix: {
                  row_1: null,
                  row_2: null,
                },
              },
              true
            )
          })

          it('should not emit change event by default', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            await checkEmits(0)
          })
        })

        describe('FORM', () => {
          it('should update internal/external data on updating FORM', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            form$.update({
              matrix: {
                row_1: 'col_2',
              },
            })

            checkModels({
              matrix: {
                row_1: 'col_2',
                row_2: null,
              },
            })
          })

          it('should emit change event on updating FORM', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.update({
              matrix: {
                row_1: 'col_2',
              },
            })

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: 'col_2',
                  row_2: null,
                },
              },
              {
                matrix: {
                  row_1: null,
                  row_2: null,
                },
              }
            )
          })

          it('should clear FORM', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: 'col_1',
                    row_2: 'col_2',
                  },
                },
              }),
            }))

            form$.clear()

            checkModels({
              matrix: {
                row_1: null,
                row_2: null,
              },
            })
          })

          it('should reset FORM', async () => {
            const data = {
              matrix: {
                row_1: 'col_2',
                row_2: null,
              },
            }

            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: data.matrix,
                },
              }),
            }))

            form$.clear()
            await nextTick()
            form$.reset()

            checkModels(data)
          })
        })

        describe('MATRIX', () => {
          it('should update internal/external data on updating MATRIX', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            form$.find('matrix').update({
              row_1: 'col_2',
            })

            checkModels({
              matrix: {
                row_1: 'col_2',
                row_2: null,
              },
            })
          })

          it('should emit change event on updating MATRIX', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.find('matrix').update({
              row_1: 'col_2',
            })

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: 'col_2',
                  row_2: null,
                },
              },
              {
                matrix: {
                  row_1: null,
                  row_2: null,
                },
              }
            )
          })

          it('should clear MATRIX', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: 'col_1',
                    row_2: 'col_2',
                  },
                },
              }),
            }))

            form$.find('matrix').clear()

            checkModels({
              matrix: {
                row_1: null,
                row_2: null,
              },
            })
          })

          it('should reset MATRIX', async () => {
            const data = {
              matrix: {
                row_1: 'col_2',
                row_2: null,
              },
            }

            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: data.matrix,
                },
              }),
            }))

            form$.find('matrix').clear()
            await nextTick()
            form$.find('matrix').reset()

            checkModels(data)
          })
        })

        describe('INPUT', () => {
          it('should update internal/external data on updating INPUT', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            form$.find('matrix.row_1.col_1').update(true)

            checkModels({
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            })

            form$.find('matrix.row_1.col_2').update(true)

            checkModels({
              matrix: {
                row_1: 'col_2',
                row_2: null,
              },
            })
          })

          it('should emit change event on updating INPUT', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.find('matrix.row_1.col_1').update(true)

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: 'col_1',
                  row_2: null,
                },
              },
              {
                matrix: {
                  row_1: null,
                  row_2: null,
                },
              }
            )

            form$.find('matrix.row_1.col_2').update(true)

            await checkEmits(
              2,
              {
                matrix: {
                  row_1: 'col_2',
                  row_2: null,
                },
              },
              {
                matrix: {
                  row_1: 'col_1',
                  row_2: null,
                },
              }
            )
          })

          it('should clear INPUT', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: 'col_1',
                    row_2: 'col_2',
                  },
                },
              }),
            }))

            form$.find('matrix.row_1.col_1').clear()

            checkModels({
              matrix: {
                row_1: null,
                row_2: 'col_2',
              },
            })
          })

          it('should reset INPUT', async () => {
            const data = {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            }

            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: data.matrix,
                },
              }),
            }))

            form$.find('matrix.row_1.col_1').clear()
            await nextTick()
            form$.find('matrix.row_1.col_1').reset()

            checkModels(data)
          })
        })

        describe('DYNAMIC', () => {
          it('should update with dynamic rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,
                  mode: 'single',
                },
              }),
            }))

            checkModels({
              matrix: [null, null],
            })

            form$.find('matrix').update(['col_1'])

            await nextTick()

            checkModels({
              matrix: ['col_1'],
            })
          })

          it('should add rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,

                  mode: 'single',
                },
              }),
            }))

            await form$.find('matrix').add()

            checkModels({
              matrix: [null, null, null],
            })
          })

          it('should remove rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,

                  mode: 'single',
                },
              }),
            }))

            form$.find('matrix').update(['col_1', 'col_2', null])

            await nextTick()

            checkModels({
              matrix: ['col_1', 'col_2', null],
            })

            form$.find('matrix').remove(1)

            checkModels({
              matrix: ['col_1', null],
            })
          })
        })
      })

      describe('CHECKBOX mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,

            mode: 'multiple',
          }
        })

        describe('BASE', () => {
          it('should have the right initial value', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            checkModels(
              {
                matrix: {
                  row_1: [],
                  row_2: [],
                },
              },
              true
            )
          })

          it('should not emit change event by default', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            await checkEmits(0)
          })
        })

        describe('FORM', () => {
          it('should update internal/external data on updating FORM', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: { ...baseSchema },
              }),
            }))

            form$.update({
              matrix: {
                row_1: ['col_1', 'col_2'],
              },
            })

            checkModels({
              matrix: {
                row_1: ['col_1', 'col_2'],
                row_2: [],
              },
            })
          })

          it('should emit change event on updating FORM', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.update({
              matrix: {
                row_1: ['col_1', 'col_2'],
              },
            })

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: ['col_1', 'col_2'],
                  row_2: [],
                },
              },
              {
                matrix: {
                  row_1: [],
                  row_2: [],
                },
              }
            )
          })

          it('should clear FORM', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: ['col_1', 'col_2'],
                    row_2: ['col_2'],
                  },
                },
              }),
            }))

            form$.clear()

            checkModels({
              matrix: {
                row_1: [],
                row_2: [],
              },
            })
          })

          it('should reset FORM', async () => {
            const data = {
              matrix: {
                row_1: ['col_1', 'col_2'],
                row_2: [],
              },
            }

            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: data.matrix,
                },
              }),
            }))

            form$.clear()
            await nextTick()
            form$.reset()

            checkModels(data)
          })
        })

        describe('MATRIX', () => {
          it('should update internal/external data on updating MATRIX', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: [],
                    row_2: ['col_1'],
                  },
                },
              }),
            }))

            form$.find('matrix').update({
              row_1: ['col_1', 'col_2'],
            })

            checkModels({
              matrix: {
                row_1: ['col_1', 'col_2'],
                row_2: ['col_1'],
              },
            })
          })

          it('should emit change event on updating MATRIX', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.find('matrix').update({
              row_1: ['col_1', 'col_2'],
            })

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: ['col_1', 'col_2'],
                  row_2: [],
                },
              },
              {
                matrix: {
                  row_1: [],
                  row_2: [],
                },
              }
            )
          })

          it('should clear MATRIX', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: ['col_1', 'col_2'],
                    row_2: ['col_2'],
                  },
                },
              }),
            }))

            form$.find('matrix').clear()

            checkModels({
              matrix: {
                row_1: [],
                row_2: [],
              },
            })
          })

          it('should reset MATRIX', async () => {
            const data = {
              matrix: {
                row_1: ['col_1', 'col_2'],
                row_2: [],
              },
            }

            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: data.matrix,
                },
              }),
            }))

            form$.find('matrix').clear()
            await nextTick()
            form$.find('matrix').reset()

            checkModels(data)
          })
        })

        describe('INPUT', () => {
          it('should update internal/external data on updating INPUT', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: ['col_1', 'col_2'],
                    row_2: ['col_1'],
                  },
                },
              }),
            }))

            form$.find('matrix.row_1.col_1').update(false)

            checkModels({
              matrix: {
                row_1: ['col_2'],
                row_2: ['col_1'],
              },
            })
          })

          it('should emit change event on updating INPUT', async () => {
            ;({ form$ } = createForm({
              onChange: onChangeForm,
              schema: defineSchema({
                matrix: { ...baseSchema, onChange: onChangeMatrix },
              }),
            }))

            form$.find('matrix.row_1.col_1').update(true)

            await checkEmits(
              1,
              {
                matrix: {
                  row_1: ['col_1'],
                  row_2: [],
                },
              },
              {
                matrix: {
                  row_1: [],
                  row_2: [],
                },
              }
            )
          })

          it('should clear INPUT', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: {
                    row_1: ['col_1', 'col_2'],
                    row_2: ['col_2'],
                  },
                },
              }),
            }))

            form$.find('matrix.row_1.col_1').clear()

            checkModels({
              matrix: {
                row_1: ['col_2'],
                row_2: ['col_2'],
              },
            })
          })

          it('should reset INPUT', async () => {
            const data = {
              matrix: {
                row_1: ['col_1', 'col_2'],
                row_2: [],
              },
            }

            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  ...baseSchema,
                  modelValue: data.matrix,
                },
              }),
            }))

            form$.find('matrix.row_1.col_2').clear()
            await nextTick()
            form$.find('matrix.row_1.col_2').reset()

            checkModels(data)
          })
        })

        describe('DYNAMIC', () => {
          it('should update with dynamic rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,

                  mode: 'multiple',
                },
              }),
            }))

            checkModels({
              matrix: [[], []],
            })

            form$.find('matrix').update([['col_1']])

            await nextTick()

            checkModels({
              matrix: [['col_1']],
            })
          })

          it('should add rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,

                  mode: 'multiple',
                },
              }),
            }))

            await form$.find('matrix').add()

            checkModels({
              matrix: [[], [], []],
            })
          })

          it('should remove rows', async () => {
            ;({ form$ } = createForm({
              schema: defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  rows: 2,

                  mode: 'multiple',
                },
              }),
            }))

            form$.find('matrix').update([['col_1'], ['col_2'], []])

            await nextTick()

            checkModels({
              matrix: [['col_1'], ['col_2'], []],
            })

            form$.find('matrix').remove(1)

            checkModels({
              matrix: [['col_1'], []],
            })
          })
        })
      })

      describe('SWITCH between modes', () => {
        it('with STATIC rows', async () => {
          const mode = ref('auto')

          ;({ form$ } = createForm({
            schema: computed(() =>
              defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  mode: mode.value,
                },
              })
            ),
          }))

          checkModels({
            matrix: {
              row_1: {
                col_1: null,
                col_2: null,
              },
              row_2: {
                col_1: null,
                col_2: null,
              },
            },
          })

          mode.value = 'single'

          await nextTick()

          checkModels({
            matrix: {
              row_1: null,
              row_2: null,
            },
          })

          mode.value = 'multiple'

          await nextTick()

          checkModels({
            matrix: {
              row_1: [],
              row_2: [],
            },
          })

          mode.value = 'auto'

          await nextTick()

          checkModels({
            matrix: {
              row_1: {
                col_1: null,
                col_2: null,
              },
              row_2: {
                col_1: null,
                col_2: null,
              },
            },
          })
        })

        it('with DYNAMIC rows', async () => {
          const mode = ref('auto')

          ;({ form$ } = createForm({
            schema: computed(() =>
              defineSchema({
                matrix: {
                  type: 'matrix',
                  ...staticSchema,
                  mode: mode.value,
                  rows: 2,
                },
              })
            ),
          }))

          checkModels({
            matrix: [
              {
                col_1: null,
                col_2: null,
              },
              {
                col_1: null,
                col_2: null,
              },
            ],
          })

          mode.value = 'single'

          await nextTick()

          checkModels({
            matrix: [null, null],
          })

          mode.value = 'multiple'

          await nextTick()

          checkModels({
            matrix: [[], []],
          })

          mode.value = 'auto'

          await nextTick()

          checkModels({
            matrix: [
              {
                col_1: null,
                col_2: null,
              },
              {
                col_1: null,
                col_2: null,
              },
            ],
          })
        })
      })
    })

    describe('FORM v-model', () => {
      describe('CUSTOM mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,
          }

          matrixSchema = { ...baseSchema }

          createVModelForm = ({ form }: { form: any; matrix: any }) => {
            const app = mountApp(
              makeApp(
                `<VfForm ${vModelAndChange('form')}>
                    <VfMatrix
                      name="matrix"
                      @change="onChangeMatrix"
                      v-bind='${JSON.stringify(matrixSchema)}'
                    />
                  </VfForm>`,
                ['matrix']
              ),
              {
                props: {
                  form,
                  'onUpdate:form': (v: any) => app.setProps({ form: v }),
                  onChangeForm,
                  onChangeMatrix,
                },
              }
            )
            const form$ = app.findComponent({ name: 'VfForm' }).vm

            // form$.$.exposeProxy = proxyRefs(form$.$.exposed)

            return {
              form$,
              app,
            }
          }
        })

        it('should have the right initial value', async () => {
          ;({ app, form$ } = await createVModelForm({
            form: {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: null,
                },
              },
            },
          }))

          checkModels(
            {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: null,
                },
              },
            },
            true
          )

          expect(app.vm.form).toEqual({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: null,
              },
            },
          })
        })

        it('should not emit change event by default', async () => {
          ;({ form$ } = createVModelForm({
            form: {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: null,
                },
              },
            },
          }))

          await checkEmits(0)
        })

        it('should emit change event on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: 'qux',
                },
              },
            },
          }))

          form$.update({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_2: 'bar',
              },
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_1: 'baz',
                col_2: 'bar',
              },
            },
          }

          await checkEmits(1, modelAfterUpdateMethod, {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: 'qux',
              },
            },
          })

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: {
                col_1: null,
                col_2: 'foo',
              },
              row_2: {
                col_1: 'bar',
                col_2: null,
              },
            },
          }

          app.setProps({
            form: {
              matrix: {
                row_1: {
                  col_1: null,
                  col_2: 'foo',
                },
                row_2: {
                  col_1: 'bar',
                  col_2: null,
                },
              },
            },
          })

          await checkEmits(2, modelAfterVModelUpdate, modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: 'qux',
                },
              },
            },
          }))

          form$.update({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_2: 'bar',
              },
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_1: 'baz',
                col_2: 'bar',
              },
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: {
                col_1: null,
                col_2: 'foo',
              },
              row_2: {
                col_1: 'bar',
                col_2: null,
              },
            },
          }

          app.setProps({
            form: {
              matrix: {
                row_1: {
                  col_1: null,
                  col_2: 'foo',
                },
                row_2: {
                  col_1: 'bar',
                  col_2: null,
                },
              },
            },
          })

          await nextTick()
          expect(app.vm.form).toEqual(modelAfterVModelUpdate)
          checkModels(modelAfterVModelUpdate)
        })

        it('should update internal/external data on updating MATRIX', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: 'qux',
                },
              },
            },
          }))

          form$.find('matrix').update({
            row_1: {
              col_1: 'foo',
              col_2: 123,
            },
            row_2: {
              col_2: 'bar',
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_1: 'baz',
                col_2: 'bar',
              },
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating INPUT', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: 'qux',
                },
              },
            },
          }))

          form$.find('matrix.row_1.col_1').update('foobar')

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: {
                col_1: 'foobar',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: 'qux',
              },
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)
        })

        it('should update with dynamic rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: [
                {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                {
                  col_1: 'baz',
                  col_2: null,
                },
              ],
            },
          }))

          const expected = {
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
            ],
          }

          checkModels(expected)
          expect(app.vm.form).toEqual(expected)

          const expectedAfterUpdateMethod = {
            matrix: [
              {
                col_1: 'foo',
                col_2: null,
              },
            ],
          }

          form$.find('matrix').update([
            {
              col_1: 'foo',
              col_2: null,
            },
          ])

          await nextTick()
          checkModels(expectedAfterUpdateMethod)
          expect(app.vm.form).toEqual(expectedAfterUpdateMethod)

          app.setProps({
            form: {
              matrix: [
                { col_1: 'foo', col_2: null },
                { col_1: 'bar', col_2: 'baz' },
              ],
            },
          })
          const expectedAfterVModelAdd = {
            matrix: [
              { col_1: 'foo', col_2: null },
              { col_1: 'bar', col_2: 'baz' },
            ],
          }
          await nextTick()
          checkModels(expectedAfterVModelAdd)
          expect(app.vm.form).toEqual(expectedAfterVModelAdd)

          app.setProps({ form: { matrix: [{ col_1: 'foo', col_2: null }] } })
          const expectedAfterVModelRemove = {
            matrix: [{ col_1: 'foo', col_2: null }],
          }
          await nextTick()
          checkModels(expectedAfterVModelRemove)
          expect(app.vm.form).toEqual(expectedAfterVModelRemove)
        })

        it('should add rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: [
                {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                {
                  col_1: 'baz',
                  col_2: null,
                },
              ],
            },
          }))

          await form$.find('matrix').add()

          const modelAfterAdd = {
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
              {
                col_1: null,
                col_2: null,
              },
            ],
          }

          checkModels(modelAfterAdd)
          expect(app.vm.form).toEqual(modelAfterAdd)
        })

        it('should remove rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: [
                {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                {
                  col_1: 'baz',
                  col_2: null,
                },
              ],
            },
          }))

          form$.find('matrix').update([
            {
              col_1: 'foo',
            },
            {
              col_2: 'bar',
            },
            {
              col_2: 'baz',
            },
            {},
          ])

          await nextTick()

          form$.find('matrix').remove(2)

          const modelAfterRemove = {
            matrix: [
              {
                col_1: 'foo',
              },
              {
                col_2: 'bar',
              },
              {
                col_1: null,
                col_2: null,
              },
            ],
          }

          checkModels(modelAfterRemove)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterRemove)
        })
      })

      describe('RADIO mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,

            mode: 'single',
          }

          matrixSchema = { ...baseSchema }

          createVModelForm = ({ form }: { form: any; matrix: any }) => {
            const app = mountApp(
              makeApp(
                `<VfForm ${vModelAndChange('form')}>
                    <VfMatrix
                      name="matrix"
                      @change="onChangeMatrix"
                      v-bind='${JSON.stringify(matrixSchema)}'
                    />
                  </VfForm>`,
                ['matrix']
              ),
              {
                props: {
                  form,
                  'onUpdate:form': (v: any) => app.setProps({ form: v }),
                  onChangeForm,
                  onChangeMatrix,
                },
              }
            )

            return {
              form$: app.findComponent({ name: 'VfForm' }).vm,
              app,
            }
          }
        })

        it('should have the right initial value', async () => {
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            },
          }))

          checkModels(
            {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            },
            true
          )

          expect(app.vm.form).toEqual({
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          })
        })

        it('should not emit change event by default', async () => {
          ;({ form$ } = createVModelForm({
            form: {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            },
          }))

          await checkEmits(0)
        })

        it('should emit change event on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            },
          }))

          form$.update({
            matrix: {
              row_2: 'col_2',
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: 'col_1',
              row_2: 'col_2',
            },
          }

          await checkEmits(1, modelAfterUpdateMethod, {
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          })

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: null,
              row_2: 'col_2',
            },
          }

          app.setProps({
            form: {
              matrix: {
                row_1: null,
                row_2: 'col_2',
              },
            },
          })

          await checkEmits(2, modelAfterVModelUpdate, modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            },
          }))

          form$.update({
            matrix: {
              row_2: 'col_2',
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: 'col_1',
              row_2: 'col_2',
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: 'col_2',
              row_2: null,
            },
          }

          app.setProps({
            form: {
              matrix: {
                row_1: 'col_2',
                row_2: null,
              },
            },
          })

          await nextTick()
          expect(app.vm.form).toEqual(modelAfterVModelUpdate)
          checkModels(modelAfterVModelUpdate)
        })

        it('should update internal/external data on updating MATRIX', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            },
          }))

          form$.find('matrix').update({
            row_2: 'col_2',
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: 'col_1',
              row_2: 'col_2',
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating INPUT', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            },
          }))

          form$.find('matrix.row_1.col_1').update(null)

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: null,
              row_2: null,
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)
        })

        it('should update with dynamic rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: ['col_1', null],
            },
          }))

          const expected = {
            matrix: ['col_1', null],
          }

          checkModels(expected)
          expect(app.vm.form).toEqual(expected)

          const expectedAfterUpdateMethod = {
            matrix: ['col_2'],
          }

          form$.find('matrix').update(['col_2'])

          await nextTick()

          checkModels(expectedAfterUpdateMethod)
          expect(app.vm.form).toEqual(expectedAfterUpdateMethod)

          app.setProps({ form: { matrix: ['col_1', 'col_2', null] } })
          const expectedAfterVModelAdd = { matrix: ['col_1', 'col_2', null] }
          await nextTick()
          checkModels(expectedAfterVModelAdd)
          expect(app.vm.form).toEqual(expectedAfterVModelAdd)

          app.setProps({ form: { matrix: ['col_1', null] } })
          const expectedAfterVModelRemove = { matrix: ['col_1', null] }
          await nextTick()
          checkModels(expectedAfterVModelRemove)
          expect(app.vm.form).toEqual(expectedAfterVModelRemove)
        })

        it('should add rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: ['col_1', null],
            },
          }))

          await form$.find('matrix').add()

          const modelAfterAdd = {
            matrix: ['col_1', null, null],
          }

          checkModels(modelAfterAdd)
          expect(app.vm.form).toEqual(modelAfterAdd)
        })

        it('should remove rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: ['col_1', null],
            },
          }))

          form$.find('matrix').update(['col_2', 'col_1', null])

          await nextTick()

          form$.find('matrix').remove(1)

          const modelAfterRemove = {
            matrix: ['col_2', null],
          }

          checkModels(modelAfterRemove)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterRemove)
        })
      })

      describe('CHECKBOX mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,

            mode: 'multiple',
          }

          matrixSchema = { ...baseSchema }

          createVModelForm = ({ form }: { form: any; matrix: any }) => {
            const app = mountApp(
              makeApp(
                `<VfForm ${vModelAndChange('form')}>
                    <VfMatrix
                      name="matrix"
                      @change="onChangeMatrix"
                      v-bind='${JSON.stringify(matrixSchema)}'
                    />
                  </VfForm>`,
                ['matrix']
              ),
              {
                props: {
                  form,
                  'onUpdate:form': (v: any) => app.setProps({ form: v }),
                  onChangeForm,
                  onChangeMatrix,
                },
              }
            )

            return {
              form$: app.findComponent({ name: 'VfForm' }).vm,
              app,
            }
          }
        })

        it('should have the right initial value', async () => {
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: {
                row_1: ['col_1'],
                row_2: [],
              },
            },
          }))

          checkModels(
            {
              matrix: {
                row_1: ['col_1'],
                row_2: [],
              },
            },
            true
          )

          expect(app.vm.form).toEqual({
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          })
        })

        it('should not emit change event by default', async () => {
          ;({ form$ } = createVModelForm({
            form: {
              matrix: {
                row_1: ['col_1'],
                row_2: [],
              },
            },
          }))

          await checkEmits(0)
        })

        it('should emit change event on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: ['col_1'],
                row_2: [],
              },
            },
          }))

          form$.update({
            matrix: {
              row_2: ['col_2'],
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: ['col_1'],
              row_2: ['col_2'],
            },
          }

          await checkEmits(1, modelAfterUpdateMethod, {
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          })

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: [],
              row_2: ['col_2'],
            },
          }

          app.setProps({
            form: {
              matrix: {
                row_1: [],
                row_2: ['col_2'],
              },
            },
          })

          await checkEmits(2, modelAfterVModelUpdate, modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: ['col_1'],
                row_2: [],
              },
            },
          }))

          form$.update({
            matrix: {
              row_2: ['col_2'],
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: ['col_1'],
              row_2: ['col_2'],
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: ['col_2'],
              row_2: [],
            },
          }

          app.setProps({
            form: {
              matrix: {
                row_1: ['col_2'],
                row_2: [],
              },
            },
          })

          await nextTick()
          expect(app.vm.form).toEqual(modelAfterVModelUpdate)
          checkModels(modelAfterVModelUpdate)
        })

        it('should update internal/external data on updating MATRIX', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: ['col_1'],
                row_2: [],
              },
            },
          }))

          form$.find('matrix').update({
            row_2: ['col_2'],
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: ['col_1'],
              row_2: ['col_2'],
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating INPUT', async () => {
          ;({ form$, app } = createVModelForm({
            form: {
              matrix: {
                row_1: ['col_1'],
                row_2: [],
              },
            },
          }))

          form$.find('matrix.row_1.col_1').update(false)
          form$.find('matrix.row_2.col_2').update(true)

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: [],
              row_2: ['col_2'],
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterUpdateMethod)
        })

        it('should update with dynamic rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: [['col_1'], []],
            },
          }))

          const expected = {
            matrix: [['col_1'], []],
          }

          checkModels(expected)
          expect(app.vm.form).toEqual(expected)

          const expectedAfterUpdateMethod = {
            matrix: [['col_2']],
          }

          form$.find('matrix').update([['col_2']])

          await nextTick()

          checkModels(expectedAfterUpdateMethod)
          expect(app.vm.form).toEqual(expectedAfterUpdateMethod)

          app.setProps({ form: { matrix: [['col_1'], ['col_2'], []] } })
          const expectedAfterVModelAdd = { matrix: [['col_1'], ['col_2'], []] }
          await nextTick()
          checkModels(expectedAfterVModelAdd)
          expect(app.vm.form).toEqual(expectedAfterVModelAdd)

          app.setProps({ form: { matrix: [['col_1'], []] } })
          const expectedAfterVModelRemove = { matrix: [['col_1'], []] }
          await nextTick()
          checkModels(expectedAfterVModelRemove)
          expect(app.vm.form).toEqual(expectedAfterVModelRemove)
        })

        it('should add rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: [['col_1'], []],
            },
          }))

          await form$.find('matrix').add()

          const modelAfterAdd = {
            matrix: [['col_1'], [], []],
          }

          checkModels(modelAfterAdd)
          expect(app.vm.form).toEqual(modelAfterAdd)
        })

        it('should remove rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: [['col_1'], []],
            },
          }))

          form$.find('matrix').update([['col_2'], ['col_1'], []])

          await nextTick()

          form$.find('matrix').remove(1)

          const modelAfterRemove = {
            matrix: [['col_2'], []],
          }

          checkModels(modelAfterRemove)
          await nextTick()
          expect(app.vm.form).toEqual(modelAfterRemove)
        })
      })

      describe('SWITCH between modes', () => {
        beforeEach(() => {
          mode = ref('auto')

          baseSchema = {
            type: 'matrix',
            ...staticSchema,
          }

          matrixSchema = { ...baseSchema }

          createVModelForm = ({ form }: { form: any; matrix: any }) => {
            const app = mountApp(
              makeApp(
                `<VfForm ${vModelAndChange('form')}>
                    <VfMatrix
                      name="matrix"
                      v-bind='${JSON.stringify(matrixSchema)}'
                      :mode="mode.value"
                    />
                  </VfForm>`,
                [],
                {
                  mode: { type: Object, default: { value: 'auto' } },
                }
              ),
              {
                props: {
                  form,
                  'onUpdate:form': (v: any) => app.setProps({ form: v }),
                  onChangeForm,
                  mode,
                },
              }
            )

            return {
              form$: app.findComponent({ name: 'VfForm' }).vm,
              app,
            }
          }
        })

        it('with STATIC rows', async () => {
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: null,
                },
              },
            },
          }))

          const expectedAuto = {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: null,
              },
            },
          }

          checkModels(expectedAuto)
          expect(app.vm.form).toEqual(expectedAuto)

          mode.value = baseSchema.mode = 'single'

          await nextTick()

          const expectedSelect = {
            matrix: {
              row_1: null,
              row_2: null,
            },
          }

          checkModels(expectedSelect)
          expect(app.vm.form).toEqual(expectedSelect)

          mode.value = baseSchema.mode = 'multiple'

          await nextTick()

          const expectedMultiselect = {
            matrix: {
              row_1: [],
              row_2: [],
            },
          }

          checkModels(expectedMultiselect)
          expect(app.vm.form).toEqual(expectedMultiselect)

          mode.value = baseSchema.mode = 'auto'

          await nextTick()

          const expectedAutoAgain = {
            matrix: {
              row_1: {
                col_1: null,
                col_2: null,
              },
              row_2: {
                col_1: null,
                col_2: null,
              },
            },
          }

          checkModels(expectedAutoAgain)
          expect(app.vm.form).toEqual(expectedAutoAgain)
        })

        it('with DYNAMIC rows', async () => {
          baseSchema.rows = 2
          matrixSchema.rows = 2
          ;({ app, form$ } = createVModelForm({
            form: {
              matrix: [
                {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                {
                  col_1: 'baz',
                  col_2: null,
                },
              ],
            },
          }))

          const expectedAuto = {
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
            ],
          }

          checkModels(expectedAuto)
          expect(app.vm.form).toEqual(expectedAuto)

          mode.value = baseSchema.mode = 'single'

          await nextTick()

          const expectedSelect = {
            matrix: [null, null],
          }

          checkModels(expectedSelect)
          expect(app.vm.form).toEqual(expectedSelect)

          mode.value = baseSchema.mode = 'multiple'

          await nextTick()

          const expectedMultiselect = {
            matrix: [[], []],
          }

          checkModels(expectedMultiselect)
          expect(app.vm.form).toEqual(expectedMultiselect)

          mode.value = baseSchema.mode = 'auto'

          await nextTick()

          const expectedAutoAgain = {
            matrix: [
              {
                col_1: null,
                col_2: null,
              },
              {
                col_1: null,
                col_2: null,
              },
            ],
          }

          checkModels(expectedAutoAgain)
          expect(app.vm.form).toEqual(expectedAutoAgain)
        })
      })
    })

    describe('MATRIX v-model', () => {
      describe('CUSTOM mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,
          }

          matrixSchema = { ...baseSchema }

          createVModelForm = ({ matrix }: { matrix: any }) => {
            const app = mountApp(
              makeApp(
                `<VfForm @change="onChangeForm">
                    <VfMatrix
                      name="matrix"
                      ${vModelAndChange('matrix')}
                      v-bind='${JSON.stringify(matrixSchema)}'
                    />
                  </VfForm>`,
                ['matrix']
              ),
              {
                props: {
                  matrix,
                  'onUpdate:form': (v: any) => app.setProps({ form: v }),
                  'onUpdate:matrix': (v: any) => app.setProps({ matrix: v }),
                  onChangeForm,
                  onChangeMatrix,
                },
              }
            )

            return {
              form$: app.findComponent({ name: 'VfForm' }).vm,
              app,
            }
          }
        })

        it('should have the right initial value', async () => {
          ;({ app, form$ } = createVModelForm({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: null,
              },
            },
          }))

          checkModels(
            {
              matrix: {
                row_1: {
                  col_1: 'foo',
                  col_2: 'bar',
                },
                row_2: {
                  col_1: 'baz',
                  col_2: null,
                },
              },
            },
            true
          )

          expect(app.vm.matrix).toEqual({
            row_1: {
              col_1: 'foo',
              col_2: 'bar',
            },
            row_2: {
              col_1: 'baz',
              col_2: null,
            },
          })
        })

        it('should not emit change event by default', async () => {
          ;({ form$ } = createVModelForm({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: null,
              },
            },
          }))

          await checkEmits(0)
        })

        it('should emit change event on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: 'qux',
              },
            },
          }))

          form$.update({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_2: 'bar',
              },
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_1: 'baz',
                col_2: 'bar',
              },
            },
          }

          await checkEmits(1, modelAfterUpdateMethod, {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: 'qux',
              },
            },
          })

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: {
                col_1: null,
                col_2: 'foo',
              },
              row_2: {
                col_1: 'bar',
                col_2: null,
              },
            },
          }

          app.setProps({
            matrix: {
              row_1: {
                col_1: null,
                col_2: 'foo',
              },
              row_2: {
                col_1: 'bar',
                col_2: null,
              },
            },
          })

          await checkEmits(2, modelAfterVModelUpdate, modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: 'qux',
              },
            },
          }))

          form$.update({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_2: 'bar',
              },
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_1: 'baz',
                col_2: 'bar',
              },
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: {
                col_1: null,
                col_2: 'foo',
              },
              row_2: {
                col_1: 'bar',
                col_2: null,
              },
            },
          }

          app.setProps({
            matrix: {
              row_1: {
                col_1: null,
                col_2: 'foo',
              },
              row_2: {
                col_1: 'bar',
                col_2: null,
              },
            },
          })

          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterVModelUpdate.matrix)
          checkModels(modelAfterVModelUpdate)
        })

        it('should update internal/external data on updating MATRIX', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: 'qux',
              },
            },
          }))

          form$.find('matrix').update({
            row_1: {
              col_1: 'foo',
              col_2: 123,
            },
            row_2: {
              col_2: 'bar',
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 123,
              },
              row_2: {
                col_1: 'baz',
                col_2: 'bar',
              },
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)
        })

        it('should update internal/external data on updating INPUT', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: 'qux',
              },
            },
          }))

          form$.find('matrix.row_1.col_1').update('foobar')

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: {
                col_1: 'foobar',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: 'qux',
              },
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)
        })

        it('should update with dynamic rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
            ],
          }))

          const expected = {
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
            ],
          }

          checkModels(expected)
          expect(app.vm.matrix).toEqual(expected.matrix)

          const expectedAfterUpdateMethod = {
            matrix: [
              {
                col_1: 'foo',
                col_2: null,
              },
            ],
          }

          form$.find('matrix').update([
            {
              col_1: 'foo',
              col_2: null,
            },
          ])

          await nextTick()

          checkModels(expectedAfterUpdateMethod)
          expect(app.vm.matrix).toEqual(expectedAfterUpdateMethod.matrix)

          app.setProps({
            matrix: [
              { col_1: 'foo', col_2: null },
              { col_1: 'bar', col_2: 'baz' },
            ],
          })
          const expectedAfterVModelAdd = {
            matrix: [
              { col_1: 'foo', col_2: null },
              { col_1: 'bar', col_2: 'baz' },
            ],
          }
          await nextTick()
          checkModels(expectedAfterVModelAdd)
          expect(app.vm.matrix).toEqual(expectedAfterVModelAdd.matrix)

          app.setProps({ matrix: [{ col_1: 'foo', col_2: null }] })
          const expectedAfterVModelRemove = {
            matrix: [{ col_1: 'foo', col_2: null }],
          }
          await nextTick()
          checkModels(expectedAfterVModelRemove)
          expect(app.vm.matrix).toEqual(expectedAfterVModelRemove.matrix)
        })

        it('should add rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
            ],
          }))

          await form$.find('matrix').add()

          const modelAfterAdd = {
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
              {
                col_1: null,
                col_2: null,
              },
            ],
          }

          checkModels(modelAfterAdd)
          expect(app.vm.matrix).toEqual(modelAfterAdd.matrix)
        })

        it('should remove rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
            ],
          }))

          form$.find('matrix').update([
            {
              col_1: 'foo',
            },
            {
              col_2: 'bar',
            },
            {
              col_2: 'baz',
            },
            {},
          ])

          await nextTick()

          form$.find('matrix').remove(2)

          const modelAfterRemove = {
            matrix: [
              {
                col_1: 'foo',
              },
              {
                col_2: 'bar',
              },
              {
                col_1: null,
                col_2: null,
              },
            ],
          }

          checkModels(modelAfterRemove)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterRemove.matrix)
        })
      })

      describe('RADIO mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,

            mode: 'single',
          }

          matrixSchema = { ...baseSchema }

          createVModelForm = ({ matrix }: { matrix: any }) => {
            const app = mountApp(
              makeApp(
                `<VfForm @change="onChangeForm">
                    <VfMatrix
                      name="matrix"
                      ${vModelAndChange('matrix')}
                      v-bind='${JSON.stringify(matrixSchema)}'
                    />
                  </VfForm>`,
                ['matrix']
              ),
              {
                props: {
                  matrix,
                  'onUpdate:form': (v: any) => app.setProps({ form: v }),
                  'onUpdate:matrix': (v: any) => app.setProps({ matrix: v }),
                  onChangeForm,
                  onChangeMatrix,
                },
              }
            )

            return {
              form$: app.findComponent({ name: 'VfForm' }).vm,
              app,
            }
          }
        })

        it('should have the right initial value', async () => {
          ;({ app, form$ } = createVModelForm({
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          }))

          checkModels(
            {
              matrix: {
                row_1: 'col_1',
                row_2: null,
              },
            },
            true
          )

          expect(app.vm.matrix).toEqual({
            row_1: 'col_1',
            row_2: null,
          })
        })

        it('should not emit change event by default', async () => {
          ;({ form$ } = createVModelForm({
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          }))

          await checkEmits(0)
        })

        it('should emit change event on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          }))

          form$.update({
            matrix: {
              row_2: 'col_2',
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: 'col_1',
              row_2: 'col_2',
            },
          }

          await checkEmits(1, modelAfterUpdateMethod, {
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          })

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: null,
              row_2: 'col_2',
            },
          }

          app.setProps({
            matrix: {
              row_1: null,
              row_2: 'col_2',
            },
          })

          await checkEmits(2, modelAfterVModelUpdate, modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          }))

          form$.update({
            matrix: {
              row_2: 'col_2',
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: 'col_1',
              row_2: 'col_2',
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: 'col_2',
              row_2: null,
            },
          }

          app.setProps({
            matrix: {
              row_1: 'col_2',
              row_2: null,
            },
          })

          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterVModelUpdate.matrix)
          checkModels(modelAfterVModelUpdate)
        })

        it('should update internal/external data on updating MATRIX', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          }))

          form$.find('matrix').update({
            row_2: 'col_2',
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: 'col_1',
              row_2: 'col_2',
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)
        })

        it('should update internal/external data on updating INPUT', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: 'col_1',
              row_2: null,
            },
          }))

          form$.find('matrix.row_1.col_1').update(null)

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: null,
              row_2: null,
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)
        })

        it('should update with dynamic rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: ['col_1', null],
          }))

          const expected = {
            matrix: ['col_1', null],
          }

          checkModels(expected)
          expect(app.vm.matrix).toEqual(expected.matrix)

          const expectedAfterUpdateMethod = {
            matrix: ['col_2'],
          }

          form$.find('matrix').update(['col_2'])

          await nextTick()

          checkModels(expectedAfterUpdateMethod)
          expect(app.vm.matrix).toEqual(expectedAfterUpdateMethod.matrix)

          app.setProps({ matrix: ['col_1', 'col_2', null] })
          const expectedAfterVModelAdd = { matrix: ['col_1', 'col_2', null] }
          await nextTick()
          checkModels(expectedAfterVModelAdd)
          expect(app.vm.matrix).toEqual(expectedAfterVModelAdd.matrix)

          app.setProps({ matrix: ['col_1', null] })
          const expectedAfterVModelRemove = { matrix: ['col_1', null] }
          await nextTick()
          checkModels(expectedAfterVModelRemove)
          expect(app.vm.matrix).toEqual(expectedAfterVModelRemove.matrix)
        })

        it('should add rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: ['col_1', null],
          }))

          await form$.find('matrix').add()

          const modelAfterAdd = {
            matrix: ['col_1', null, null],
          }

          checkModels(modelAfterAdd)
          expect(app.vm.matrix).toEqual(modelAfterAdd.matrix)
        })

        it('should remove rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: ['col_1', null],
          }))

          form$.find('matrix').update(['col_2', 'col_1', null])

          await nextTick()

          form$.find('matrix').remove(1)

          const modelAfterRemove = {
            matrix: ['col_2', null],
          }

          checkModels(modelAfterRemove)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterRemove.matrix)
        })
      })

      describe('CHECKBOX mode', () => {
        beforeEach(() => {
          baseSchema = {
            type: 'matrix',
            ...staticSchema,

            mode: 'multiple',
          }

          matrixSchema = { ...baseSchema }

          createVModelForm = ({ matrix }: { matrix: any }) => {
            const app = mountApp(
              makeApp(
                `<VfForm @change="onChangeForm">
                    <VfMatrix
                      name="matrix"
                      ${vModelAndChange('matrix')}
                      v-bind='${JSON.stringify(matrixSchema)}'
                    />
                  </VfForm>`,
                ['matrix']
              ),
              {
                props: {
                  matrix,
                  'onUpdate:form': (v: any) => app.setProps({ form: v }),
                  'onUpdate:matrix': (v: any) => app.setProps({ matrix: v }),
                  onChangeForm,
                  onChangeMatrix,
                },
              }
            )

            return {
              form$: app.findComponent({ name: 'VfForm' }).vm,
              app,
            }
          }
        })

        it('should have the right initial value', async () => {
          ;({ app, form$ } = createVModelForm({
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          }))

          checkModels(
            {
              matrix: {
                row_1: ['col_1'],
                row_2: [],
              },
            },
            true
          )

          expect(app.vm.matrix).toEqual({
            row_1: ['col_1'],
            row_2: [],
          })
        })

        it('should not emit change event by default', async () => {
          ;({ form$ } = createVModelForm({
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          }))

          await checkEmits(0)
        })

        it('should emit change event on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          }))

          form$.update({
            matrix: {
              row_2: ['col_2'],
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: ['col_1'],
              row_2: ['col_2'],
            },
          }

          await checkEmits(1, modelAfterUpdateMethod, {
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          })

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: [],
              row_2: ['col_2'],
            },
          }

          app.setProps({
            matrix: {
              row_1: [],
              row_2: ['col_2'],
            },
          })

          await checkEmits(2, modelAfterVModelUpdate, modelAfterUpdateMethod)
        })

        it('should update internal/external data on updating FORM', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          }))

          form$.update({
            matrix: {
              row_2: ['col_2'],
            },
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: ['col_1'],
              row_2: ['col_2'],
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)

          const modelAfterVModelUpdate = {
            matrix: {
              row_1: ['col_2'],
              row_2: [],
            },
          }

          app.setProps({
            matrix: {
              row_1: ['col_2'],
              row_2: [],
            },
          })

          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterVModelUpdate.matrix)
          checkModels(modelAfterVModelUpdate)
        })

        it('should update internal/external data on updating MATRIX', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          }))

          form$.find('matrix').update({
            row_2: ['col_2'],
          })

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: ['col_1'],
              row_2: ['col_2'],
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)
        })

        it('should update internal/external data on updating INPUT', async () => {
          ;({ form$, app } = createVModelForm({
            matrix: {
              row_1: ['col_1'],
              row_2: [],
            },
          }))

          form$.find('matrix.row_1.col_1').update(false)
          form$.find('matrix.row_2.col_2').update(true)

          const modelAfterUpdateMethod = {
            matrix: {
              row_1: [],
              row_2: ['col_2'],
            },
          }

          checkModels(modelAfterUpdateMethod)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterUpdateMethod.matrix)
        })

        it('should update with dynamic rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: [['col_1'], []],
          }))

          const expected = {
            matrix: [['col_1'], []],
          }

          checkModels(expected)
          expect(app.vm.matrix).toEqual(expected.matrix)

          const expectedAfterUpdateMethod = {
            matrix: [['col_2']],
          }

          form$.find('matrix').update([['col_2']])

          await nextTick()

          checkModels(expectedAfterUpdateMethod)
          expect(app.vm.matrix).toEqual(expectedAfterUpdateMethod.matrix)

          app.setProps({ matrix: [['col_1'], ['col_2'], []] })
          const expectedAfterVModelAdd = { matrix: [['col_1'], ['col_2'], []] }
          await nextTick()
          checkModels(expectedAfterVModelAdd)
          expect(app.vm.matrix).toEqual(expectedAfterVModelAdd.matrix)

          app.setProps({ matrix: [['col_1'], []] })
          const expectedAfterVModelRemove = { matrix: [['col_1'], []] }
          await nextTick()
          checkModels(expectedAfterVModelRemove)
          expect(app.vm.matrix).toEqual(expectedAfterVModelRemove.matrix)
        })

        it('should add rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: [['col_1'], []],
          }))

          await form$.find('matrix').add()

          const modelAfterAdd = {
            matrix: [['col_1'], [], []],
          }

          checkModels(modelAfterAdd)
          expect(app.vm.matrix).toEqual(modelAfterAdd.matrix)
        })

        it('should remove rows', async () => {
          matrixSchema = {
            ...baseSchema,
            rows: 2,
          }
          ;({ app, form$ } = createVModelForm({
            matrix: [['col_1'], []],
          }))

          form$.find('matrix').update([['col_2'], ['col_1'], []])

          await nextTick()

          form$.find('matrix').remove(1)

          const modelAfterRemove = {
            matrix: [['col_2'], []],
          }

          checkModels(modelAfterRemove)
          await nextTick()
          expect(app.vm.matrix).toEqual(modelAfterRemove.matrix)
        })
      })

      describe('SWITCH between modes', () => {
        beforeEach(() => {
          mode = ref('auto')

          baseSchema = {
            type: 'matrix',
            ...staticSchema,
          }

          matrixSchema = { ...baseSchema }

          createVModelForm = ({ matrix }: { matrix: any }) => {
            const app = mountApp(
              makeApp(
                `<VfForm>
                    <VfMatrix
                      name="matrix"
                      ${vModelAndChange('matrix')}
                      v-bind='${JSON.stringify(matrixSchema)}'
                      :mode="mode.value"
                    />
                  </VfForm>`,
                ['matrix'],
                {
                  mode: { type: Object, default: { value: 'auto' } },
                }
              ),
              {
                props: {
                  matrix,
                  'onUpdate:matrix': (v: any) => app.setProps({ matrix: v }),
                  onChangeMatrix,
                  mode,
                },
              }
            )

            return {
              form$: app.findComponent({ name: 'VfForm' }).vm,
              app,
            }
          }
        })

        it('with STATIC rows', async () => {
          ;({ app, form$ } = createVModelForm({
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: null,
              },
            },
          }))

          const expectedAuto = {
            matrix: {
              row_1: {
                col_1: 'foo',
                col_2: 'bar',
              },
              row_2: {
                col_1: 'baz',
                col_2: null,
              },
            },
          }

          checkModels(expectedAuto)
          expect(app.vm.matrix).toEqual(expectedAuto.matrix)

          mode.value = baseSchema.mode = 'single'

          await nextTick()

          const expectedSelect = {
            matrix: {
              row_1: null,
              row_2: null,
            },
          }

          checkModels(expectedSelect)
          expect(app.vm.matrix).toEqual(expectedSelect.matrix)

          mode.value = baseSchema.mode = 'multiple'

          await nextTick()

          const expectedMultiselect = {
            matrix: {
              row_1: [],
              row_2: [],
            },
          }

          checkModels(expectedMultiselect)
          expect(app.vm.matrix).toEqual(expectedMultiselect.matrix)

          mode.value = baseSchema.mode = 'auto'

          await nextTick()

          const expectedAutoAgain = {
            matrix: {
              row_1: {
                col_1: null,
                col_2: null,
              },
              row_2: {
                col_1: null,
                col_2: null,
              },
            },
          }

          checkModels(expectedAutoAgain)
          expect(app.vm.matrix).toEqual(expectedAutoAgain.matrix)
        })

        it('with DYNAMIC rows', async () => {
          baseSchema.rows = 2
          matrixSchema.rows = 2
          ;({ app, form$ } = createVModelForm({
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
            ],
          }))

          const expectedAuto = {
            matrix: [
              {
                col_1: 'foo',
                col_2: 'bar',
              },
              {
                col_1: 'baz',
                col_2: null,
              },
            ],
          }

          checkModels(expectedAuto)
          expect(app.vm.matrix).toEqual(expectedAuto.matrix)

          mode.value = baseSchema.mode = 'single'

          await nextTick()

          const expectedSelect = {
            matrix: [null, null],
          }

          checkModels(expectedSelect)
          expect(app.vm.matrix).toEqual(expectedSelect.matrix)

          mode.value = baseSchema.mode = 'multiple'

          await nextTick()

          const expectedMultiselect = {
            matrix: [[], []],
          }

          checkModels(expectedMultiselect)
          expect(app.vm.matrix).toEqual(expectedMultiselect.matrix)

          mode.value = baseSchema.mode = 'auto'

          await nextTick()

          const expectedAutoAgain = {
            matrix: [
              {
                col_1: null,
                col_2: null,
              },
              {
                col_1: null,
                col_2: null,
              },
            ],
          }

          checkModels(expectedAutoAgain)
          expect(app.vm.matrix).toEqual(expectedAutoAgain.matrix)
        })
      })
    })
  })
})

describe('Checked state rendering', () => {
  it('should render checked radios matching the model in SINGLE mode', async () => {
    const { form, form$ } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          mode: 'single',
          ...staticSchema,
          modelValue: {
            row_1: 'col_2',
            row_2: null,
          },
        },
      }),
    })

    await nextTick()

    // Order: row_1/col_1, row_1/col_2, row_2/col_1, row_2/col_2
    const radios = form.findAll<HTMLInputElement>('input[type="radio"]')

    expect(radios.map((r) => r.element.checked)).toEqual([
      false,
      true,
      false,
      false,
    ])

    await radios[2].setValue()

    expect(form$.model).toEqual({
      matrix: {
        row_1: 'col_2',
        row_2: 'col_1',
      },
    })
    expect(radios.map((r) => r.element.checked)).toEqual([
      false,
      true,
      true,
      false,
    ])
  })

  it('should render checked checkboxes matching the model in MULTIPLE mode', async () => {
    const { form, form$ } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          mode: 'multiple',
          ...staticSchema,
          modelValue: {
            row_1: ['col_1'],
            row_2: [],
          },
        },
      }),
    })

    await nextTick()

    // Order: row_1/col_1, row_1/col_2, row_2/col_1, row_2/col_2
    const checkboxes = form.findAll<HTMLInputElement>('input[type="checkbox"]')

    expect(checkboxes.map((c) => c.element.checked)).toEqual([
      true,
      false,
      false,
      false,
    ])

    await checkboxes[1].setValue(true)

    expect(form$.model).toEqual({
      matrix: {
        row_1: ['col_1', 'col_2'],
        row_2: [],
      },
    })
    expect(checkboxes.map((c) => c.element.checked)).toEqual([
      true,
      true,
      false,
      false,
    ])

    await checkboxes[0].setValue(false)

    expect(form$.model).toEqual({
      matrix: {
        row_1: ['col_2'],
        row_2: [],
      },
    })
    expect(checkboxes.map((c) => c.element.checked)).toEqual([
      false,
      true,
      false,
      false,
    ])
  })
})
