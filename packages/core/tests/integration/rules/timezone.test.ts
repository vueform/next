import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('timezone', () => {
  it('should pass for valid timezone UTC', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'timezone', default: 'UTC' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for America/New_York', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'timezone', default: 'America/New_York' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for Europe/London', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'timezone', default: 'Europe/London' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for Asia/Tokyo', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'timezone', default: 'Asia/Tokyo' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for invalid timezone', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'timezone', default: 'Invalid/Timezone' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for random string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'timezone', default: 'notazone' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'timezone', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
