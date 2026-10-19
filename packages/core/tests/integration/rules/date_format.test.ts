import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

// The native date adapter has no format tokens: `format()` warns once and
// returns the ISO string, so only values that round-trip through
// `toISOString()` match. Format-token behavior belongs to the date plugins.
describe('date_format', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('should pass when the value round-trips through the adapter format', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'date_format:YYYY-MM-DD',
          default: '2021-05-15T00:00:00.000Z',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when the formatted value differs from the input', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'date_format:YYYY-MM-DD',
          default: '2021-05-15',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for an empty value', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'date_format:YYYY-MM-DD', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
