import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('boolean', () => {
  it('should pass for true', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'checkbox', rules: 'boolean', default: true },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for false', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'checkbox', rules: 'boolean', default: false },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for 1 (number)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'boolean', default: 1 },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for 0 (number)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'boolean', default: 0 },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for "1" (string)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'boolean', default: '1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for "0" (string)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'boolean', default: '0' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for "yes"', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'boolean', default: 'yes' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for "true"', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'boolean', default: 'true' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for a random string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'boolean', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for 2', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'boolean', default: 2 },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
