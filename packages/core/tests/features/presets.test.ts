import { defineSchema } from '@vueform/core'
import { nextTick, ref } from 'vue'
import { createForm } from '../helpers'

describe('Presets', () => {
  test('it should use direct component prop first', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'label',
            presets: ['text'],
          },
        }),
      },
      {
        presets: {
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('label')
  })

  test('it should use component preset prop', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
      },
      {
        presets: {
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
  })

  test('it should not inherit non-cascading presets', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            help: 'form-help',
          },
        },
      }
    )

    expect(text.props.help).toBe(undefined)
  })

  test('it should inherit cascading preset', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $cascade: true,
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe('form-help')
  })

  test('it should inherit preset if $cascade is not defined but applied to component', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: 'VfText',
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe('form-help')
  })

  test('it should inherit preset if $cascade is not defined and not applied to component', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: 'VfGroup',
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe(undefined)
  })

  test('it should inherit preset if $cascade is not defined but component is included in $apply', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: ['VfGroup', 'VfText'],
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe('form-help')
  })

  test('it should inherit preset if $cascade is not defined and apply is this', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: 'this',
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe(undefined)
  })

  test('it should inherit preset if $cascade is not defined and apply only includes this', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: ['this'],
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe(undefined)
  })

  test('it should inherit preset if $cascade is not defined and apply includes this and component', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: ['this', 'VfText'],
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe('form-help')
  })

  test('it should inherit preset if $cascade is not defined and apply includes this and *element', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: ['*element', 'VfText'],
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe('form-help')
  })

  test('it should inherit preset if $cascade is not defined and apply includes this and *', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: ['*', 'VfText'],
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe('form-help')
  })

  test('it should inherit preset if $cascade is not defined but applied to *element', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: '*element',
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe('form-help')
  })

  test('it should inherit preset if $cascade is not defined but applied to *', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: '*',
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe('form-help')
  })

  test('it should prevent cascade', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['text'],
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: '*',
            $cascade: false,
            label: 'form-label',
            help: 'form-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('text-label')
    expect(text.props.help).toBe(undefined)
  })

  test('it should merge cascaded props', () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          container: {
            type: 'group',
            presets: ['container'],
            schema: {
              text: {
                type: 'text',
                presets: ['text'],
              },
            },
          },
        }),
        presets: ['form'],
      },
      {
        presets: {
          form: {
            $apply: '*',
            label: 'form-label',
            help: 'form-help',
            autocomplete: 'form-autocomplete',
          },
          container: {
            $apply: '*',
            label: 'container-label',
            help: 'container-help',
          },
          text: {
            label: 'text-label',
          },
        },
      }
    )

    expect(form.findComponent({ name: 'VfText' }).vm.props.label).toBe(
      'text-label'
    )
    expect(form.findComponent({ name: 'VfText' }).vm.props.help).toBe(
      'container-help'
    )
    expect(form.findComponent({ name: 'VfText' }).vm.props.autocomplete).toBe(
      'form-autocomplete'
    )
  })

  test('it should merge multiple cascaded props', () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          container: {
            type: 'group',
            presets: ['container', 'container2'],
            schema: {
              text: {
                type: 'text',
                presets: ['text', 'text2'],
              },
            },
          },
        }),
        presets: ['form', 'form2'],
      },
      {
        presets: {
          form: {
            $apply: '*',
            label: 'form-label',
            help: 'form-help',
            autocomplete: 'form-autocomplete',
            displayName: 'form-displayName',
          },
          form2: {
            $apply: '*',
            label: 'form2-label',
            help: 'form2-help',
            autocomplete: 'form2-autocomplete',
          },
          container: {
            $apply: '*',
            label: 'container-label',
            help: 'container-help',
            placeholder: 'container-placeholder',
          },
          container2: {
            $apply: '*',
            label: 'container2-label',
            help: 'container2-help',
          },
          text: {
            label: 'text-label',
            debounce: 'text-debounce',
          },
          text2: {
            label: 'text2-label',
          },
        },
      }
    )

    const props = form.findComponent({ name: 'VfText' }).vm.props

    expect(props.label).toBe('text2-label')
    expect(props.debounce).toBe('text-debounce')
    expect(props.help).toBe('container2-help')
    expect(props.placeholder).toBe('container-placeholder')
    expect(props.autocomplete).toBe('form2-autocomplete')
    expect(props.displayName).toBe('form-displayName')
  })

  test('it apply presets when component presets change', async () => {
    const schema = ref(
      defineSchema({
        text: {
          type: 'text',
        },
      })
    ) as any

    const { form } = createForm(
      {
        schema,
      },
      {
        presets: {
          text: {
            label: 'text-label',
          },
        },
      }
    )

    const props = form.findComponent({ name: 'VfText' }).vm.props

    expect(props.label).toBe(undefined)

    schema.value.text.presets = ['text']
    await nextTick()
    expect(props.label).toBe('text-label')
  })

  // test('it apply presets when cascading presets change', async () => {
  //   const App = defineComponent({
  //     template: `
  //         <VfForm :presets="formPresets">
  //           <VfText name="text" :presets="['text']" />
  //         </VfForm>
  //         `,
  //     setup: () => {
  //       const formPresets = ref([])

  //       const setFormPresets = (preset: string[]) => {
  //         formPresets.value = preset
  //       }

  //       return {
  //         formPresets,
  //         setFormPresets,
  //       }
  //     },
  //   })

  //   const app = mount(App, {
  //     global: {
  //       plugins: [
  //         createVueform({
  //           locales: { en_US: {} },
  //           components,
  //           presets: {
  //             form: {
  //               $cascade: true,
  //               label: 'form-label',
  //               help: 'form-help',
  //             },
  //             text: {
  //               label: 'text-label',
  //             },
  //           },
  //         }),
  //       ],
  //     },
  //   })

  //   const props = app.findComponent({ name: 'VfText' }).vm.props

  //   expect(props.label).toBe('text-label')
  //   expect(props.help).toBe(undefined)

  //   app.vm.setFormPresets(['form'])
  //   await nextTick()
  //   expect(props.label).toBe('text-label')
  //   expect(props.help).toBe('form-help')
  // })
})
