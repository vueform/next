import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('accepted', () => {
  it('should pass for "yes"', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: 'yes' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for "on"', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: 'on' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for "1" (string)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: '1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for "true" (string)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: 'true' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for true (boolean)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'checkbox', rules: 'accepted', default: true },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for 1 (number)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: 1 },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for "no"', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: 'no' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for "false"', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: 'false' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for 0', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: 0 },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass after updating to accepted value', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'accepted', default: 'no' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('yes')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
