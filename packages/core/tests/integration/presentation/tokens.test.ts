import { createVueformFactory, defineSchema, model } from '#core'

import { createForm2 } from '../../helpers'

const schema = defineSchema({
  text: { type: 'text', label: 'Foo' },
})

function getTokenCss(form: ReturnType<typeof createForm2>) {
  return form.find('style').text()
}

describe('Tokens', () => {
  describe('scoped overrides', () => {
    it('should emit the overridden token as a scoped custom property', () => {
      const form = createForm2(
        { schema, tokens: { gutter: '120px' } },
        { tokens: { gutter: '1rem' } }
      )

      expect(getTokenCss(form)).toContain('--vf-gutter:120px')
    })

    it('should re-declare tokens referencing an overridden token', () => {
      const form = createForm2(
        { schema, tokens: { gutter: '120px' } },
        {
          tokens: {
            gutter: '1rem',
            elementsGutterY: '$gutter',
            elementsGutterX: '$gutter',
          },
        }
      )

      const css = getTokenCss(form)

      expect(css).toContain('--vf-gutter:120px')
      expect(css).toContain('--vf-elements-gutter-y:var(--vf-gutter)')
      expect(css).toContain('--vf-elements-gutter-x:var(--vf-gutter)')
    })

    it('should re-declare transitive dependents of an overridden token', () => {
      const form = createForm2(
        { schema, tokens: { space: '2rem' } },
        {
          tokens: {
            space: '1rem',
            gapX: '$space',
            rowGap: 'calc($gapX * 2)',
          },
        }
      )

      const css = getTokenCss(form)

      expect(css).toContain('--vf-space:2rem')
      expect(css).toContain('--vf-gap-x:var(--vf-space)')
      expect(css).toContain('--vf-row-gap:calc(var(--vf-gap-x) * 2)')
    })

    it('should not re-declare tokens unrelated to the override', () => {
      const form = createForm2(
        { schema, tokens: { gutter: '120px' } },
        {
          tokens: {
            gutter: '1rem',
            primary: '#000',
            btnColor: '$primary',
          },
        }
      )

      expect(getTokenCss(form)).not.toContain('--vf-btn-color')
    })

    it('should let an explicit override win over a re-declared dependent', () => {
      const form = createForm2(
        { schema, tokens: { gutter: '120px', elementsGutterY: '3rem' } },
        {
          tokens: {
            gutter: '1rem',
            elementsGutterY: '$gutter',
          },
        }
      )

      const css = getTokenCss(form)

      expect(css).toContain('--vf-elements-gutter-y:3rem')
      expect(css).not.toContain('--vf-elements-gutter-y:var(--vf-gutter)')
    })

    it('should survive circular token references without hanging', () => {
      const form = createForm2(
        { schema, tokens: { a: '5px' } },
        {
          tokens: {
            a: '$b',
            b: '$a',
          },
        }
      )

      expect(getTokenCss(form)).toContain('--vf-a:5px')
    })
  })

  describe('theme config option', () => {
    const bakedTheme = {
      gutter: '1rem',
      brand: '#000',
      dark: { brand: '#fff' },
    }

    const makeInstance = (userConfig: Record<string, any>) =>
      createVueformFactory({ modules: { model }, theme: bakedTheme })(
        userConfig as any
      )

    it('should resolve the entry-baked theme into config.tokens', () => {
      const vueform = makeInstance({})

      expect(vueform.config.tokens).toEqual(bakedTheme)
    })

    it('should merge `tokens` overrides onto the baked theme', () => {
      const vueform = makeInstance({
        tokens: { gutter: '2rem', dark: { gutter: '3rem' } },
      })

      expect(vueform.config.tokens).toEqual({
        gutter: '2rem',
        brand: '#000',
        dark: { brand: '#fff', gutter: '3rem' },
      })
    })

    it('should replace the baked theme wholesale when `theme` is passed', () => {
      const vueform = makeInstance({
        theme: { radius: '4px', dark: { radius: '8px' } },
      })

      // No bleed-through from the baked theme — dark block included.
      expect(vueform.config.tokens).toEqual({
        radius: '4px',
        dark: { radius: '8px' },
      })
    })

    it('should merge `tokens` overrides onto a passed `theme`', () => {
      const vueform = makeInstance({
        theme: { radius: '4px', gutter: '1rem' },
        tokens: { gutter: '2rem' },
      })

      expect(vueform.config.tokens).toEqual({
        radius: '4px',
        gutter: '2rem',
      })
    })

    it('should keep supporting entries that bake their theme via `tokens`', () => {
      const vueform = createVueformFactory({
        modules: { model },
        tokens: bakedTheme,
      })({ tokens: { gutter: '2rem' } } as any)

      expect(vueform.config.tokens).toEqual({
        gutter: '2rem',
        brand: '#000',
        dark: { brand: '#fff' },
      })
    })
  })

  describe('dark mode', () => {
    it('should re-declare dependents using dark definitions when dark', () => {
      const form = createForm2(
        { schema, dark: true, tokens: { gutter: '120px' } },
        {
          tokens: {
            gutter: '1rem',
            elementsGutterY: '$gutter',
            dark: { elementsGutterY: 'calc($gutter * 2)' },
          },
        }
      )

      expect(getTokenCss(form)).toContain(
        '--vf-elements-gutter-y:calc(var(--vf-gutter) * 2)'
      )
    })

    it('should not re-declare a dependent the dark theme sets to a concrete value', () => {
      const form = createForm2(
        { schema, dark: true, tokens: { gutter: '120px' } },
        {
          tokens: {
            gutter: '1rem',
            elementsGutterY: '$gutter',
            dark: { elementsGutterY: '2rem' },
          },
        }
      )

      // The dark `:root` block already holds the concrete value; re-declaring
      // the light `var()` definition here would wrongly override it.
      expect(getTokenCss(form)).not.toContain('--vf-elements-gutter-y')
    })

    it('should keep light definitions when not dark', () => {
      const form = createForm2(
        { schema, dark: false, tokens: { gutter: '120px' } },
        {
          tokens: {
            gutter: '1rem',
            elementsGutterY: '$gutter',
            dark: { elementsGutterY: '2rem' },
          },
        }
      )

      expect(getTokenCss(form)).toContain(
        '--vf-elements-gutter-y:var(--vf-gutter)'
      )
    })
  })
})
