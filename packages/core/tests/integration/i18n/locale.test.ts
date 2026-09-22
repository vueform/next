import { defineSchema } from '@vueform/core'
import { en_US, hu_HU } from '@vueform/core/locales'
import { createForm } from '../../helpers'

describe('Locale', () => {
  describe('Default Locale', () => {
    it('should use the first locale key as the default', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                en_US: 'Name',
                hu_HU: 'Név',
              },
            },
          }),
        },
        {
          locales: { en_US, hu_HU },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Name')
    })

    it('should use the first locale key even when it is not English', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                en_US: 'Name',
                hu_HU: 'Név',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Név')
    })
  })

  describe('Localized Labels', () => {
    it('should localize label from a record based on current locale', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                en_US: 'Name',
                hu_HU: 'Név',
              },
            },
          }),
        },
        {
          locales: { en_US, hu_HU },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Name')
    })

    it('should localize label for a non-English default locale', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                en_US: 'Name',
                hu_HU: 'Név',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Név')
    })

    it('should fall back to fallbackLocale when label is missing for current locale', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                en_US: 'Name',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Name')
    })

    it('should fall back to first key when neither locale nor fallback is present in label', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                de_DE: 'Name (DE)',
                fr_FR: 'Nom',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Name (DE)')
    })

    it('should return string label as-is regardless of locale', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: 'Static Label',
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Static Label')
    })
  })

  describe('Localized Help', () => {
    it('should localize help from a record', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              help: {
                en_US: 'Enter your name',
                hu_HU: 'Írd be a neved',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.help).toBe('Írd be a neved')
    })

    it('should fall back to fallbackLocale for help when current locale is missing', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              help: {
                en_US: 'Enter your name',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.help).toBe('Enter your name')
    })
  })

  describe('Localized Placeholder', () => {
    it('should localize placeholder from a record', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              placeholder: {
                en_US: 'Your name...',
                hu_HU: 'A neved...',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.placeholder).toBe('A neved...')
    })

    it('should fall back to fallbackLocale for placeholder when current locale is missing', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              placeholder: {
                en_US: 'Your name...',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.placeholder).toBe('Your name...')
    })
  })

  describe('Validation Error Messages', () => {
    it('should show error messages in the default locale', async () => {
      const { email } = createForm(
        {
          schema: defineSchema({
            email: { type: 'text', rules: 'required' },
          }),
        },
        {
          locales: { en_US },
          fallbackLocale: 'en_US',
        }
      )

      await email.validate()
      expect(email.errors[0]).toBe('The email field is required.')
    })

    it('should show error messages in Hungarian when it is the default locale', async () => {
      const { email } = createForm(
        {
          schema: defineSchema({
            email: { type: 'text', rules: 'required' },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      await email.validate()
      expect(email.errors[0]).toBe('A(z) email megadása kötelező!')
    })

    it('should replace {param} parameters in error messages', async () => {
      const { name } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', rules: 'min:5', default: 'ab' },
          }),
        },
        {
          locales: { en_US },
          fallbackLocale: 'en_US',
        }
      )

      await name.validate()
      expect(name.errors[0]).toBe('The name must be at least 5 characters.')
    })

    it('should replace {param} parameters in Hungarian error messages', async () => {
      const { name } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', rules: 'min:5', default: 'ab' },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      await name.validate()
      expect(name.errors[0]).toBe(
        'A(z) name hossza nem lehet kevesebb, mint 5 karakter.'
      )
    })

    it('should fall back to English error messages when tag is missing in current locale', async () => {
      const partial_locale: Record<string, string> = {
        list_add: 'Ajouter',
      }

      const { name } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', rules: 'required' },
          }),
        },
        {
          locales: { partial_locale, en_US },
          fallbackLocale: 'en_US',
        }
      )

      await name.validate()
      expect(name.errors[0]).toBe('The name field is required.')
    })
  })

  describe('Multiple Localized Elements', () => {
    it('should localize all elements based on the default locale', () => {
      const { first, last } = createForm(
        {
          schema: defineSchema({
            first: {
              type: 'text',
              label: {
                en_US: 'First Name',
                hu_HU: 'Keresztnév',
              },
            },
            last: {
              type: 'text',
              label: {
                en_US: 'Last Name',
                hu_HU: 'Vezetéknév',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(first.label).toBe('Keresztnév')
      expect(last.label).toBe('Vezetéknév')
    })

    it('should localize elements with different locale keys in the same form', () => {
      const { first, last } = createForm(
        {
          schema: defineSchema({
            first: {
              type: 'text',
              label: {
                en_US: 'First Name',
                hu_HU: 'Keresztnév',
              },
            },
            last: {
              type: 'text',
              label: {
                en_US: 'Last Name',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(first.label).toBe('Keresztnév')
      expect(last.label).toBe('Last Name')
    })
  })

  describe('Mixed Localized and Static Props', () => {
    it('should handle elements with mixed static and localized props', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                en_US: 'Localized Label',
                hu_HU: 'Lokalizált Címke',
              },
              help: 'Static help',
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Lokalizált Címke')
      expect(text.help).toBe('Static help')
    })

    it('should handle all text props with localized records', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                en_US: 'Name',
                hu_HU: 'Név',
              },
              help: {
                en_US: 'Enter your name',
                hu_HU: 'Írd be a neved',
              },
              placeholder: {
                en_US: 'Your name...',
                hu_HU: 'A neved...',
              },
            },
          }),
        },
        {
          locales: { hu_HU, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Név')
      expect(text.help).toBe('Írd be a neved')
      expect(text.placeholder).toBe('A neved...')
    })
  })

  describe('Custom Locale', () => {
    it('should work with a custom locale definition', async () => {
      const fr_FR: Record<string, string> = {
        list_add: 'Ajouter',
        steps_next: 'Suivant',
        steps_back: 'Retour',
        steps_finish: 'Terminer',
        default_message: 'Champ invalide',
        rule_required_error: 'Le champ {attribute} est requis.',
        rule_email_error:
          'Le champ {attribute} doit être une adresse e-mail valide.',
      }

      const { email } = createForm(
        {
          schema: defineSchema({
            email: {
              type: 'text',
              rules: 'required|email',
              label: {
                fr_FR: 'Courriel',
                en_US: 'Email',
              },
            },
          }),
        },
        {
          locales: { fr_FR, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(email.label).toBe('Courriel')

      await email.validate()
      expect(email.errors[0]).toBe('Le champ Courriel est requis.')
    })

    it('should fall back to the fallback locale for missing custom locale tags', async () => {
      const fr_FR: Record<string, string> = {
        rule_required_error: 'Le champ {attribute} est requis.',
      }

      const { name } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', rules: 'required|min:3' },
          }),
        },
        {
          locales: { fr_FR, en_US },
          fallbackLocale: 'en_US',
        }
      )

      name.update('ab')
      await name.validate()

      const errors = name.errors
      expect(errors[0]).toBe('The name must be at least 3 characters.')
    })
  })

  describe('Fallback Locale Behavior', () => {
    it('should use tags from fallback locale when current locale is incomplete', () => {
      const partial_locale: Record<string, string> = {
        list_add: 'Aggiungi',
      }

      const { text } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'text',
              label: {
                partial_locale: 'Nome',
                en_US: 'Name',
              },
            },
          }),
        },
        {
          locales: { partial_locale, en_US },
          fallbackLocale: 'en_US',
        }
      )

      expect(text.label).toBe('Nome')
    })

    it('should use fallback for error messages when tag is missing in current locale', async () => {
      const empty_locale: Record<string, string> = {
        list_add: 'Add',
      }

      const { name } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', rules: 'required' },
          }),
        },
        {
          locales: { empty_locale, en_US },
          fallbackLocale: 'en_US',
        }
      )

      await name.validate()
      expect(name.errors[0]).toBe('The name field is required.')
    })
  })
})
