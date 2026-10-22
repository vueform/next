import {
  defineSchema,
  type HttpAdapter,
  type HttpRequestConfig,
} from '@vueform/core'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

const mockAdapter = (): {
  adapter: HttpAdapter
  calls: HttpRequestConfig[]
} => {
  const calls: HttpRequestConfig[] = []

  const adapter: HttpAdapter = async (config) => {
    calls.push(config)
    return {
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as any
  }

  return { adapter, calls }
}

const schema = defineSchema({ name: { type: 'text' } })

describe('attachment seams', () => {
  it('clean() resets the form dirty state after edits', async () => {
    const { form$, name } = createForm({ schema })
    await nextTick()

    name.update('Jane')
    await nextTick()
    expect(form$.dirty).toBe(true)

    form$.clean()
    await nextTick()
    expect(form$.dirty).toBe(false)
  })

  it('mirrors dirty between the attached instance and the form', async () => {
    const host = createForm({ schema })
    const model$ = host.vueform.useModel({ schema }, { name: 'John' })

    const { form$, name } = createForm({ schema, modelValue: model$ })
    await nextTick()

    expect(form$.dirty).toBe(false)
    expect(model$.dirty).toBe(false)

    name.update('Jane')
    await nextTick()
    expect(form$.dirty).toBe(true)
    expect(model$.dirty).toBe(true)

    form$.clean()
    await nextTick()
    expect(form$.dirty).toBe(false)
    expect(model$.dirty).toBe(false)
  })

  it('warns when a second form attaches the same instance', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const host = createForm({ schema })
    const model$ = host.vueform.useModel({ schema })

    createForm({ schema, modelValue: model$ })
    await nextTick()
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('already attached')
    )

    createForm({ schema, modelValue: model$ })
    await nextTick()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('already attached')
    )

    warn.mockRestore()
  })

  it('keeps the last form attached when an earlier one unmounts', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { adapter, calls } = mockAdapter()

    const host = createForm({ schema }, { $http: { adapter } })
    const model$ = host.vueform.useModel({ schema }, { name: 'John' })

    const first = createForm(
      { schema, modelValue: model$, endpoint: '/api/first' },
      { $http: { adapter } }
    )
    const second = createForm(
      { schema, modelValue: model$, endpoint: '/api/second' },
      { $http: { adapter } }
    )
    await nextTick()

    // The first form's unmount must not detach the second (release guard).
    first.form.unmount()
    await nextTick()

    expect(model$.attached).toBe(true)

    const result: any = await model$.submit()
    expect(result).toEqual(expect.objectContaining({ type: 'success' }))
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/second')
    expect(second.form$.submits).toBe(1)

    warn.mockRestore()
  })

  it('detaches when the sole attaching form unmounts', async () => {
    const host = createForm({ schema })
    const model$ = host.vueform.useModel({ schema }, { name: 'John' })

    const { form } = createForm({ schema, modelValue: model$ })
    await nextTick()
    expect(model$.attached).toBe(true)

    form.unmount()
    expect(model$.attached).toBe(false)
    expect(model$.model.name).toBe('John')
  })
})
