import { defineSchema } from '@vueform/core'
import { createForm2, createForm, getClass } from '../helpers'

function getContainerColClass(form: any, nth = 0) {
  return getClass(form, { name: 'VfText' }, nth).replace(
    'vf-element vf-text vf-align-label ',
    ''
  )
}

function getLabelGroupColClass(form: any, nth = 0) {
  return getClass(form, '.vf-label-group', nth).replace('vf-label-group ', '')
}

function getElGroupColClass(form: any, nth = 0) {
  return getClass(form, '.vf-element-group', nth).replace(
    'vf-element-group ',
    ''
  )
}

function getElWrapperColClass(form: any, nth = 0) {
  return getClass(form, '.vf-element-wrapper', nth).replace(
    'vf-element-wrapper ',
    ''
  )
}

describe('Columns', () => {
  it('should display default columns', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-12')
    expect(getLabelGroupColClass(form)).toBe('vf-col-12 vf-vertical')
    expect(getElGroupColClass(form)).toBe('vf-col-12')
    expect(getElWrapperColClass(form)).toBe('vf-col-12')
  })

  it('should display columns when numeric', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: 9,
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-9')
    expect(getLabelGroupColClass(form)).toBe('vf-col-12 vf-vertical')
    expect(getElGroupColClass(form)).toBe('vf-col-12')
    expect(getElWrapperColClass(form)).toBe('vf-col-12')
  })

  it('should display columns when `container` is defined', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { container: 9 },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-9')
    expect(getLabelGroupColClass(form)).toBe('vf-col-12 vf-vertical')
    expect(getElGroupColClass(form)).toBe('vf-col-12')
    expect(getElWrapperColClass(form)).toBe('vf-col-12')
  })

  it('should display columns when `label` is defined', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { label: 3 },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-12')
    expect(getLabelGroupColClass(form)).toBe('vf-col-3 vf-horizontal')
    expect(getElGroupColClass(form)).toBe('vf-col-9')
    expect(getElWrapperColClass(form)).toBe('vf-col-12')
  })

  it('should display columns when `wrapper` is defined', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { wrapper: 9 },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-12')
    expect(getLabelGroupColClass(form)).toBe('vf-col-12 vf-vertical')
    expect(getElGroupColClass(form)).toBe('vf-col-12')
    expect(getElWrapperColClass(form)).toBe('vf-col-9')
  })

  it('should display columns when all defined', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { container: 9, label: 3, wrapper: 5 },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-9')
    expect(getLabelGroupColClass(form)).toBe('vf-col-3 vf-horizontal')
    expect(getElGroupColClass(form)).toBe('vf-col-9')
    expect(getElWrapperColClass(form)).toBe('vf-col-5')
  })

  it('should display columns when breakpoints are defined for container', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { md: 6, lg: { container: 8 } },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-12 vf-col-md-6 vf-col-lg-8')
    expect(getLabelGroupColClass(form)).toBe('vf-col-12 vf-vertical')
    expect(getElGroupColClass(form)).toBe('vf-col-12')
    expect(getElWrapperColClass(form)).toBe('vf-col-12')
  })

  it('should display columns when breakpoints are defined for container', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { md: 6, lg: { container: 8, label: 3, wrapper: 5 } },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-12 vf-col-md-6 vf-col-lg-8')
    expect(getLabelGroupColClass(form)).toBe(
      'vf-col-12 vf-vertical vf-col-lg-3 vf-col-lg:vf-horizontal'
    )
    expect(getElGroupColClass(form)).toBe('vf-col-12 vf-col-lg-9')
    expect(getElWrapperColClass(form)).toBe('vf-col-12 vf-col-lg-5')
  })

  it('should treat `base` as an alias for the default breakpoint', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { base: 3 },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-3')
    expect(getLabelGroupColClass(form)).toBe('vf-col-12 vf-vertical')
    expect(getElGroupColClass(form)).toBe('vf-col-12')
    expect(getElWrapperColClass(form)).toBe('vf-col-12')
  })

  it('should merge `base` with other breakpoints', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { base: 3, lg: 6 },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-3 vf-col-lg-6')
  })

  it('should support `base` with a per-section object', async () => {
    const form = createForm2({
      schema: defineSchema({
        text: {
          type: 'text',
          label: 'Foo',
          columns: { base: { container: 3, label: 4, wrapper: 5 } },
        },
      }),
    })

    expect(getContainerColClass(form)).toBe('vf-col-3')
    expect(getLabelGroupColClass(form)).toBe('vf-col-4 vf-horizontal')
    expect(getElGroupColClass(form)).toBe('vf-col-8')
    expect(getElWrapperColClass(form)).toBe('vf-col-5')
  })

  describe('function', () => {
    it('should resolve columns from function returning a number', () => {
      const form = createForm2({
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'Foo',
            columns: () => 9,
          },
        }),
      })

      expect(getContainerColClass(form)).toBe('vf-col-9')
      expect(getLabelGroupColClass(form)).toBe('vf-col-12 vf-vertical')
      expect(getElGroupColClass(form)).toBe('vf-col-12')
      expect(getElWrapperColClass(form)).toBe('vf-col-12')
    })

    it('should resolve columns from function returning an object', () => {
      const form = createForm2({
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'Foo',
            columns: () => ({ container: 9, label: 3, wrapper: 5 }),
          },
        }),
      })

      expect(getContainerColClass(form)).toBe('vf-col-9')
      expect(getLabelGroupColClass(form)).toBe('vf-col-3 vf-horizontal')
      expect(getElGroupColClass(form)).toBe('vf-col-9')
      expect(getElWrapperColClass(form)).toBe('vf-col-5')
    })

    it('should resolve columns from function returning breakpoints', () => {
      const form = createForm2({
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'Foo',
            columns: () => ({ md: 6, lg: { container: 8 } }),
          },
        }),
      })

      expect(getContainerColClass(form)).toBe(
        'vf-col-12 vf-col-md-6 vf-col-lg-8'
      )
    })

    it('should pass element context to the function', () => {
      const form = createForm2({
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'Foo',
            columns: (el$: any) => (el$.name === 'text' ? 9 : 12),
          },
        }),
      })

      expect(getContainerColClass(form)).toBe('vf-col-9')
    })
  })

  describe('expression', () => {
    it('should resolve columns from expression as single value', () => {
      const { text } = createForm({
        schema: defineSchema({
          cols: { type: 'text', default: 9 },
          text: { type: 'text', columns: 'cols' },
        }),
      })

      const bp = Object.keys(text.resolvedColumns)[0]
      expect(text.resolvedColumns[bp].container).toBe(9)
      expect(text.resolvedColumns[bp].label).toBe(12)
      expect(text.resolvedColumns[bp].wrapper).toBe(12)
    })

    it('should resolve columns from math expression', () => {
      const { text } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 3 },
          b: { type: 'text', default: 6 },
          text: { type: 'text', columns: 'a + b' },
        }),
      })

      const bp = Object.keys(text.resolvedColumns)[0]
      expect(text.resolvedColumns[bp].container).toBe(9)
    })

    it('should resolve columns from expression with built-in function', () => {
      const { text } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 3 },
          b: { type: 'text', default: 6 },
          text: { type: 'text', columns: 'SUM(a, b)' },
        }),
      })

      const bp = Object.keys(text.resolvedColumns)[0]
      expect(text.resolvedColumns[bp].container).toBe(9)
    })

    it('should resolve columns from expression in object values', () => {
      const { text } = createForm({
        schema: defineSchema({
          cont: { type: 'text', default: 9 },
          lbl: { type: 'text', default: 3 },
          wrp: { type: 'text', default: 5 },
          text: {
            type: 'text',
            columns: { container: 'cont', label: 'lbl', wrapper: 'wrp' },
          },
        }),
      })

      const bp = Object.keys(text.resolvedColumns)[0]
      expect(text.resolvedColumns[bp].container).toBe(9)
      expect(text.resolvedColumns[bp].label).toBe(3)
      expect(text.resolvedColumns[bp].group).toBe(9)
      expect(text.resolvedColumns[bp].wrapper).toBe(5)
    })

    it('should resolve columns from expression in breakpoint values', () => {
      const { text } = createForm({
        schema: defineSchema({
          md_cols: { type: 'text', default: 6 },
          lg_cont: { type: 'text', default: 8 },
          text: {
            type: 'text',
            columns: { md: 'md_cols', lg: { container: 'lg_cont' } },
          },
        }),
      })

      expect(text.resolvedColumns.md.container).toBe(6)
      expect(text.resolvedColumns.lg.container).toBe(8)
    })

    it('should reactively update columns when referenced field changes', () => {
      const { cols, text } = createForm({
        schema: defineSchema({
          cols: { type: 'text', default: 9 },
          text: { type: 'text', columns: 'cols' },
        }),
      })

      const bp = Object.keys(text.resolvedColumns)[0]
      expect(text.resolvedColumns[bp].container).toBe(9)

      cols.update(6)
      expect(text.resolvedColumns[bp].container).toBe(6)
    })

    it('should not resolve expressions when expression plugin is not installed', () => {
      const form = createForm2({
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'Foo',
            columns: '9',
          },
        }),
      })

      expect(getContainerColClass(form)).toBe('vf-col-9')
    })
  })
})
