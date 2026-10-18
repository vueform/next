import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

// =============================================================================
// FILE SEMANTICS
// =============================================================================
describe('VfFile a11y', () => {
  it('should label remove buttons for pre-existing files by 1-based index', async () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          multiple: true,
          default: ['report.pdf', 'image.png'],
        },
      }),
    })

    await nextTick()

    expect(form.find('button[aria-label="Remove file 1"]').exists()).toBe(true)
    expect(form.find('button[aria-label="Remove file 2"]').exists()).toBe(true)
    expect(form.find('button[aria-label="Remove file 3"]').exists()).toBe(false)
  })

  it('should carry describedby and error state on the hidden file input', async () => {
    const { form, file } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          label: 'The label',
          help: 'The help text',
          rules: 'required',
        },
      }),
    })

    const input = form.find('input[type="file"]')
    const id = input.attributes('id')!

    expect(input.attributes('aria-describedby')!.split(' ')).toContain(
      `${id}__help`
    )
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(input.attributes('aria-required')).toBe('true')

    await file.validate()
    await nextTick()

    expect(input.attributes('aria-invalid')).toBe('true')

    const describedby = input.attributes('aria-describedby')!.split(' ')
    expect(describedby).toContain(`${id}__error`)

    const error = form.find(`[id="${id}__error"]`)
    expect(error.exists()).toBe(true)
    expect(error.attributes('role')).toBe('alert')
  })
})
