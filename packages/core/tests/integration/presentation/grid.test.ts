import { defineSchema } from '@vueform/core'

import { createForm2, getClass } from '../../helpers'

function getGridCss() {
  return document.getElementById('vueform-theme')?.textContent ?? ''
}

function getMediaWidths(css: string, type: 'min' | 'max') {
  const re = new RegExp(`@media \\(${type}-width: (\\d+)px\\)`, 'g')
  const widths: number[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(css)) !== null) {
    widths.push(Number(match[1]))
  }
  return widths
}

function getContainerColClass(form: any, nth = 0) {
  return getClass(form, { name: 'VfText' }, nth).replace(
    'vf-element vf-text vf-align-label ',
    ''
  )
}

describe('Grid', () => {
  describe('mobile-first (default)', () => {
    it('should emit `min-width` queries in ascending order', () => {
      createForm2({
        schema: defineSchema({
          text: { type: 'text', label: 'Foo' },
        }),
      })

      const css = getGridCss()
      const widths = getMediaWidths(css, 'min')

      expect(widths).toEqual([640, 768, 1024, 1280, 1536])
      expect(css).not.toContain('max-width')
    })

    it('should keep named breakpoints prefixed', () => {
      const form = createForm2({
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'Foo',
            columns: { sm: 6, lg: { container: 4 } },
          },
        }),
      })

      expect(getContainerColClass(form)).toBe(
        'vf-col-12 vf-col-sm-6 vf-col-lg-4'
      )
    })
  })

  describe('desktop-first (mobileFirst: false)', () => {
    it('should emit `max-width` queries in descending order', () => {
      createForm2(
        {
          schema: defineSchema({
            text: { type: 'text', label: 'Foo' },
          }),
        },
        { mobileFirst: false }
      )

      const css = getGridCss()
      const widths = getMediaWidths(css, 'max')

      expect(widths).toEqual([1536, 1280, 1024, 768, 640])
      expect(css).not.toContain('min-width')
    })

    it('should keep named breakpoints prefixed', () => {
      const form = createForm2(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: 'Foo',
              columns: { '2xl': 6, sm: { container: 4 } },
            },
          }),
        },
        { mobileFirst: false }
      )

      expect(getContainerColClass(form)).toBe(
        'vf-col-12 vf-col-2xl-6 vf-col-sm-4'
      )
    })
  })
})
