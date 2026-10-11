import { defineSchema } from '@vueform/core'
import { defineComponent, nextTick, ref } from 'vue'

import { createForm, mountApp } from '../../helpers'

describe('Prop defaults', () => {
  test('it should use direct component prop', () => {
    const { text } = createForm({
      schema: defineSchema({
        text: {
          type: 'text',
          inputType: 'number',
        },
      }),
    })

    expect(text.props.inputType).toBe('number')
  })

  test('it should use default component prop', () => {
    const { text } = createForm({
      schema: defineSchema({
        text: {
          type: 'text',
        },
      }),
    })

    expect(text.props.inputType).toBe('text')
  })

  test('it should use a prop defined in config directly for that element', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'label',
          },
        }),
      },
      {
        defaults: {
          VfText: {
            label: 'VfText-label',
            help: 'VfText-help',
          },
        },
      }
    )

    expect(text.props.label).toBe('label')
    expect(text.props.help).toBe('VfText-help')
  })

  test('it should use a prop defined in config for *element', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'label',
          },
        }),
      },
      {
        defaults: {
          '*element': {
            label: '*element-label',
            help: '*element-help',
            inputType: '*element-inputType',
          },
          VfText: {
            label: 'VfText-label',
            help: 'VfText-help',
          },
        },
      }
    )

    expect(text.props.label).toBe('label')
    expect(text.props.help).toBe('VfText-help')
    expect(text.props.inputType).toBe('*element-inputType')
  })

  test('it should use a prop defined in config for *', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'label',
          },
        }),
      },
      {
        defaults: {
          '*': {
            label: '*-label',
            help: '*-help',
            inputType: '*-inputType',
            autocomplete: '*-autocomplete',
          },
          '*element': {
            label: '*element-label',
            help: '*element-help',
            inputType: '*element-inputType',
          },
          VfText: {
            label: 'VfText-label',
            help: 'VfText-help',
          },
        },
      }
    )

    expect(text.props.label).toBe('label')
    expect(text.props.help).toBe('VfText-help')
    expect(text.props.inputType).toBe('*element-inputType')
    expect(text.props.autocomplete).toBe('*-autocomplete')
  })

  test('it should use new props', async () => {
    const schema = ref(
      defineSchema({
        text: {
          type: 'text',
          label: 'label',
        },
      })
    ) as any

    const { text } = createForm({
      schema,
    })

    expect(text.props.label).toBe('label')
    expect(text.props.help).toBe(undefined)

    schema.value.text.help = 'help'
    await nextTick()
    expect(text.props.label).toBe('label')
    expect(text.props.help).toBe('help')
  })

  test('it should use modified props', async () => {
    const schema = ref(
      defineSchema({
        text: {
          type: 'text',
          conditions: [['text2', '==', 'foo']],
        },
        text2: {
          type: 'text',
        },
      })
    ) as any

    const { text } = createForm({
      schema,
    })

    expect(text.props.conditions[0][2]).toBe('foo')

    schema.value.text.conditions[0][2] = 'bar'
    await nextTick()
    expect(text.props.conditions[0][2]).toBe('bar')
  })
})

describe('Resolution priority', () => {
  test('it should use config default over blueprint default', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
          },
        }),
      },
      {
        defaults: {
          VfText: {
            inputType: 'email',
          },
        },
      }
    )

    expect(text.props.inputType).toBe('email')
  })

  test('it should use preset over blueprint and config defaults', () => {
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
        defaults: {
          VfText: {
            inputType: 'email',
          },
        },
        presets: {
          text: {
            inputType: 'tel',
          },
        },
      }
    )

    expect(text.props.inputType).toBe('tel')
  })

  test('it should use user prop over preset', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            inputType: 'url',
            presets: ['text'],
          },
        }),
      },
      {
        defaults: {
          VfText: {
            inputType: 'email',
          },
        },
        presets: {
          text: {
            inputType: 'tel',
          },
        },
      }
    )

    expect(text.props.inputType).toBe('url')
  })

  test('it should replace blueprint default presets with user presets while combining config presets', () => {
    const { test } = createForm(
      {
        schema: defineSchema({
          test: {
            type: 'test',
            testPresets: ['pDefault'],
            presets: ['pUser'],
          },
        } as any),
      },
      {
        presets: {
          pDefault: {
            label: 'p-default-label',
            help: 'p-default-help',
            placeholder: 'p-default-placeholder',
          },
          pConfig: {
            label: 'p-config-label',
            help: 'p-config-help',
          },
          pUser: {
            label: 'p-user-label',
          },
        },
        defaults: {
          VfTest: {
            presets: ['pConfig'],
          },
        },
      }
    )

    expect(test.props.label).toBe('p-user-label')
    expect(test.props.help).toBe('p-config-help')
    // User-passed `presets` replaces the blueprint default presets entirely
    // (Vue `withDefaults` semantics), so `pDefault` never applies.
    expect(test.props.placeholder).toBe(undefined)
  })

  test('it should resolve to undefined when no value exists anywhere', () => {
    const { text } = createForm({
      schema: defineSchema({
        text: {
          type: 'text',
        },
      }),
    })

    expect(text.props.autocomplete).toBe(undefined)
  })
})

describe('User value semantics', () => {
  test('it should let falsy user values override defaults and presets', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            disabled: false,
            debounce: 0,
            presets: ['p'],
          },
        }),
      },
      {
        defaults: {
          VfText: {
            debounce: 500,
          },
        },
        presets: {
          p: {
            disabled: true,
          },
        },
      }
    )

    expect(text.props.disabled).toBe(false)
    expect(text.props.debounce).toBe(0)
  })

  test('it should let user null stick over defaults', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            label: null,
          },
        } as any),
      },
      {
        defaults: {
          VfText: {
            label: 'config-label',
          },
        },
      }
    )

    expect(text.props.label).toBe(null)
  })

  test('it should fall back to defaults when user passes undefined', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            label: undefined,
          },
        }),
      },
      {
        defaults: {
          VfText: {
            label: 'config-label',
          },
        },
      }
    )

    expect(text.props.label).toBe('config-label')
  })

  test('it should merge plain object user values with object defaults', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            ruleMessages: { email: 'user-email' },
          },
        }),
      },
      {
        defaults: {
          VfText: {
            ruleMessages: { required: 'config-required' },
          },
        },
      }
    )

    expect(text.props.ruleMessages).toEqual({
      required: 'config-required',
      email: 'user-email',
    })
  })

  test('it should replace object defaults with user objects when mergeObjectProps is false', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            ruleMessages: { email: 'user-email' },
          },
        }),
      },
      {
        mergeObjectProps: false,
        defaults: {
          VfText: {
            ruleMessages: { required: 'config-required' },
          },
        },
      } as any
    )

    expect(text.props.ruleMessages).toEqual({ email: 'user-email' })
  })

  test('it should replace array defaults with user arrays', () => {
    const { text } = createForm({
      schema: defineSchema({
        text: {
          type: 'text',
          untrackOn: ['blur'],
        },
      } as any),
    })

    expect(text.props.untrackOn).toEqual(['blur'])
  })

  test('it should apply preset boolean when the boolean prop is absent', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['p'],
          },
        }),
      },
      {
        presets: {
          p: {
            disabled: true,
          },
        },
      }
    )

    expect(text.props.disabled).toBe(true)
  })

  test('it should treat kebab-case template props as user values', () => {
    const app = mountApp(
      defineComponent({
        template: `
          <VfForm>
            <VfText name="text" input-type="email" :presets="['p']" />
          </VfForm>
        `,
      }),
      {},
      {
        presets: {
          p: {
            inputType: 'tel',
          },
        },
      } as any
    )

    expect(app.findComponent({ name: 'VfText' }).vm.props.inputType).toBe(
      'email'
    )
  })

  test('it should treat valueless boolean attributes as user values', () => {
    const app = mountApp(
      defineComponent({
        template: `
          <VfForm>
            <VfText name="text" disabled :presets="['p']" />
          </VfForm>
        `,
      }),
      {},
      {
        presets: {
          p: {
            disabled: false,
          },
        },
      } as any
    )

    // Bare attributes on Booleanish props resolve to '' (Vue behavior for
    // `boolean | string` props) and must win over preset values. Downstream
    // consumers (makeDisabled) normalize '' to true.
    expect(app.findComponent({ name: 'VfText' }).vm.props.disabled).toBe('')
    expect(app.find('input').attributes('disabled')).toBeDefined()
  })
})

describe('Blueprint defaults', () => {
  test('it should use static blueprint default', () => {
    const { test } = createForm({
      schema: defineSchema({
        test: {
          type: 'test',
        },
      } as any),
    })

    expect(test.props.testStatic).toBe('static-default')
  })

  test('it should use user prop over static blueprint default', () => {
    const { test } = createForm({
      schema: defineSchema({
        test: {
          type: 'test',
          testStatic: 'custom',
        },
      } as any),
    })

    expect(test.props.testStatic).toBe('custom')
  })

  test('it should resolve factory defaults from other props once at setup', async () => {
    const schema = ref(
      defineSchema({
        test: {
          type: 'test',
          testSource: 'foo',
        },
      } as any)
    ) as any

    const { test } = createForm({ schema })

    expect(test.props.testDerived).toBe('foo-derived')

    schema.value.test.testSource = 'bar'
    await nextTick()

    // Matches Vue's own behavior: factory defaults are not re-evaluated
    // when the props they derive from change.
    expect(test.props.testDerived).toBe('foo-derived')
  })

  test('it should resolve object and array factory defaults', () => {
    const { test } = createForm({
      schema: defineSchema({
        test: {
          type: 'test',
        },
      } as any),
    })

    expect(test.props.testObj).toEqual({ a: 1, b: 2 })
    expect(test.props.testArr).toEqual(['a', 'b'])
  })

  test('it should not share factory default objects between instances', () => {
    const { form } = createForm({
      schema: defineSchema({
        test: {
          type: 'test',
        },
        test2: {
          type: 'test',
        },
      } as any),
    })

    const [a, b] = form.findAllComponents({ name: 'VfTest' })

    expect(a.vm.props.testObj).toEqual(b.vm.props.testObj)
    expect(a.vm.props.testObj).not.toBe(b.vm.props.testObj)
  })

  test('it should keep function defaults for function-typed props without executing them', () => {
    const { test } = createForm({
      schema: defineSchema({
        test: {
          type: 'test',
        },
      } as any),
    })

    expect(typeof test.props.testFn).toBe('function')
    expect(test.props.testFn('x')).toBe('fn-x')
  })

  test('it should replace object blueprint defaults with user objects', () => {
    const { test } = createForm({
      schema: defineSchema({
        test: {
          type: 'test',
          testObj: { b: 20, c: 3 },
        },
      } as any),
    })

    // Blueprint defaults are applied by Vue's `withDefaults`, which replaces
    // the default wholesale when the user passes a value — no merging.
    expect(test.props.testObj).toEqual({ b: 20, c: 3 })
  })
})

describe('Config defaults', () => {
  test('it should resolve config defaults for non-runtime (@vue-ignore) props', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
          },
        }),
      },
      {
        defaults: {
          VfText: {
            'part:input': { 'data-source': 'config' },
          },
        },
      } as any
    )

    expect(text.props['part:input']).toEqual({ 'data-source': 'config' })
  })

  test('it should merge user-passed @vue-ignore props with config defaults', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            'part:input': { 'data-user': 'user' },
          },
        } as any),
      },
      {
        defaults: {
          VfText: {
            'part:input': { 'data-source': 'config' },
          },
        },
      } as any
    )

    expect(text.props['part:input']).toEqual({
      'data-source': 'config',
      'data-user': 'user',
    })
  })

  test('it should update @vue-ignore props reactively', async () => {
    const schema = ref(
      defineSchema({
        text: {
          type: 'text',
          'part:input': { 'data-source': 'user' },
        },
      } as any)
    ) as any

    const { text } = createForm({ schema }, {
      defaults: {
        VfText: {
          'part:input': { 'data-source': 'config' },
        },
      },
    } as any)

    expect(text.props['part:input']['data-source']).toBe('user')

    schema.value.text['part:input'] = { 'data-source': 'updated' }
    await nextTick()

    expect(text.props['part:input']['data-source']).toBe('updated')
  })

  test('it should merge classes defaults across config layers', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
          },
        }),
      },
      {
        defaults: {
          '*element': {
            classes: { root: 'star-root' },
          },
          VfText: {
            classes: { help: 'vftext-help' },
          },
        },
      }
    )

    expect(text.props.classes.root).toBe('star-root')
    expect(text.props.classes.help).toBe('vftext-help')
  })

  test('it should not share config default objects between element instances', () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
          },
          text2: {
            type: 'text',
          },
        }),
      },
      {
        defaults: {
          VfText: {
            ruleMessages: { required: 'config-required' },
          },
        },
      }
    )

    const [a, b] = form.findAllComponents({ name: 'VfText' })

    expect(a.vm.props.ruleMessages).toEqual({ required: 'config-required' })
    expect(a.vm.props.ruleMessages).toEqual(b.vm.props.ruleMessages)
    expect(a.vm.props.ruleMessages).not.toBe(b.vm.props.ruleMessages)
  })
})

describe('Preset sources and semantics', () => {
  test('it should apply inline object presets from the presets prop', () => {
    const { text } = createForm({
      schema: defineSchema({
        text: {
          type: 'text',
          presets: [{ label: 'inline-label' }],
        },
      }),
    })

    expect(text.props.label).toBe('inline-label')
  })

  test('it should apply inline array preset definitions', () => {
    const { text } = createForm({
      schema: defineSchema({
        text: {
          type: 'text',
          presets: [[{ label: 'first-label' }, { help: 'second-help' }]],
        },
      } as any),
    })

    expect(text.props.label).toBe('first-label')
    expect(text.props.help).toBe('second-help')
  })

  test('it should warn and skip unknown preset names', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { text } = createForm({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'label',
          presets: ['missing'],
        },
      }),
    })

    expect(text.props.label).toBe('label')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing'))

    warn.mockRestore()
  })

  test('it should apply presets defined as names in config defaults', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
          },
        }),
      },
      {
        presets: {
          fromConfig: {
            label: 'config-preset-label',
          },
        },
        defaults: {
          VfText: {
            presets: ['fromConfig'],
          },
        },
      }
    )

    expect(text.props.label).toBe('config-preset-label')
  })

  test('it should apply presets defined as objects in config defaults', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
          },
        }),
      },
      {
        defaults: {
          VfText: {
            presets: [{ label: 'object-preset-label' }],
          },
        },
      } as any
    )

    expect(text.props.label).toBe('object-preset-label')
  })

  test('it should apply presets coming from blueprint defaults', () => {
    const { test } = createForm(
      {
        schema: defineSchema({
          test: {
            type: 'test',
            testPresets: ['fromBlueprint'],
          },
        } as any),
      },
      {
        presets: {
          fromBlueprint: {
            label: 'blueprint-preset-label',
          },
        },
      }
    )

    expect(test.props.label).toBe('blueprint-preset-label')
  })

  test('it should apply presets with a function matcher', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['fn'],
          },
        }),
      },
      {
        presets: {
          fn: {
            $apply: (component: any) => component.name === 'VfText',
            label: 'fn-label',
          },
        },
      } as any
    )

    expect(text.props.label).toBe('fn-label')
  })

  test('it should replace instead of merge when $merge is false', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['rm'],
          },
        }),
      },
      {
        defaults: {
          VfText: {
            ruleMessages: { required: 'config-required' },
          },
        },
        presets: {
          rm: {
            $merge: false,
            ruleMessages: { email: 'preset-email' },
          },
        },
      }
    )

    expect(text.props.ruleMessages).toEqual({ email: 'preset-email' })
  })

  test('it should apply the same preset name only once across sources', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['dup'],
          },
        }),
      },
      {
        presets: {
          dup: {
            classes: { root: 'dup-root' },
          },
        },
        defaults: {
          VfText: {
            presets: ['dup'],
          },
        },
      }
    )

    expect(text.props.classes.root).toBe('dup-root')
  })

  test('it should keep null preset values', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['nullify'],
          },
        }),
      },
      {
        defaults: {
          VfText: {
            label: 'config-label',
          },
        },
        presets: {
          nullify: {
            label: null,
          },
        },
      } as any
    )

    expect(text.props.label).toBe(null)
  })

  test('it should not apply cascaded this to descendants', () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          container: {
            type: 'group',
            schema: {
              text: {
                type: 'text',
              },
            },
          },
        }),
        presets: ['formPreset'],
      },
      {
        presets: {
          formPreset: {
            $apply: ['this', 'VfGroup'],
            label: 'form-label',
          },
        },
      }
    )

    expect(form.findComponent({ name: 'VfGroup' }).vm.props.label).toBe(
      'form-label'
    )
    expect(form.findComponent({ name: 'VfText' }).vm.props.label).toBe(
      undefined
    )
  })

  test('it should resolve preset values for @vue-ignore props', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['parts'],
          },
        }),
      },
      {
        presets: {
          parts: {
            'part:input': { 'data-x': 'preset' },
          },
        },
      } as any
    )

    expect(text.props['part:input']).toEqual({ 'data-x': 'preset' })
  })

  test('it should not introduce unknown preset keys into resolved props', () => {
    const { text } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'text',
            presets: ['bogus'],
          },
        }),
      },
      {
        presets: {
          bogus: {
            totallyUnknown: 'x',
          },
        },
      } as any
    )

    expect(text.props.totallyUnknown).toBe(undefined)
  })
})

describe('Pass-through attrs', () => {
  test('it should not include undeclared attrs in resolved props', () => {
    const { text } = createForm({
      schema: defineSchema({
        text: {
          type: 'text',
          undeclaredAttr: 'x',
        },
      } as any),
    })

    expect(text.props.undeclaredAttr).toBe(undefined)
  })
})
