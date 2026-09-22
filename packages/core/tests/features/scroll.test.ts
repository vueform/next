import {
  defineSchema,
  HttpError,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
import { nextTick } from 'vue'
import { createForm, flushPromises } from '../helpers'

function mockAdapter(response: Partial<HttpResponse> = {}): {
  adapter: HttpAdapter
  calls: HttpRequestConfig[]
} {
  const calls: HttpRequestConfig[] = []

  const adapter: HttpAdapter = async <T = any>(
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    calls.push(config)
    return {
      data: (response.data ?? null) as T,
      status: response.status ?? 200,
      statusText: response.statusText ?? 'OK',
      headers: response.headers ?? {},
      config,
    }
  }

  return { adapter, calls }
}

function errorAdapter(
  status: number,
  data: any = null,
  reason?: string
): HttpAdapter {
  return async (config) => {
    const response: HttpResponse = {
      data,
      status,
      statusText:
        status === 422 ? 'Unprocessable Entity' : 'Internal Server Error',
      headers: {},
      config,
    }
    throw new HttpError(
      `Request failed with status ${status}`,
      config,
      (reason ?? 'http') as any,
      response
    )
  }
}

let scrollIntoViewSpy: ReturnType<typeof vi.fn>
let focusSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  scrollIntoViewSpy = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoViewSpy as any

  Element.prototype.getBoundingClientRect = vi.fn(
    () =>
      ({
        top: 2000,
        bottom: 2100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 2000,
      }) as DOMRect
  )

  focusSpy = vi.fn()
  HTMLElement.prototype.focus = focusSpy as any
})

// ============ el$.scrollTo ==============

describe('el$.scrollTo', () => {
  it('should call scrollIntoView with smooth behavior by default', async () => {
    const { form$ } = createForm({
      schema: defineSchema({
        name: { type: 'text' },
      }),
    })

    await form$.find('name').scrollTo()

    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('should pass custom ScrollIntoViewOptions through', async () => {
    const { form$ } = createForm({
      schema: defineSchema({
        name: { type: 'text' },
      }),
    })

    await form$.find('name').scrollTo({ behavior: 'instant', block: 'center' })

    expect(scrollIntoViewSpy).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'center',
    })
  })

  it('should select the correct step before scrolling in a stepped form', async () => {
    const { form$ } = createForm({
      stepped: true,
      schema: defineSchema({
        step1: {
          type: 'group',
          page: 'Step 1',
          schema: { name: { type: 'text' } },
        },
        step2: {
          type: 'group',
          page: 'Step 2',
          schema: { email: { type: 'text' } },
        },
      }),
    })

    expect(form$.steps.page).toBe('step1')

    await form$.find('step2').scrollTo()
    await nextTick()

    expect(form$.steps.page).toBe('step2')
    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })

  it('should select the correct step for a nested element', async () => {
    const { form$ } = createForm({
      stepped: true,
      schema: defineSchema({
        step1: {
          type: 'group',
          page: 'Step 1',
          schema: { name: { type: 'text' } },
        },
        step2: {
          type: 'group',
          page: 'Step 2',
          schema: {
            details: {
              type: 'group',
              schema: { email: { type: 'text' } },
            },
          },
        },
      }),
    })

    expect(form$.steps.page).toBe('step1')

    await form$.find('step2.details.email').scrollTo()
    await nextTick()

    expect(form$.steps.page).toBe('step2')
    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })

  it('should select the correct tab before scrolling in a tabbed form', async () => {
    const { form$ } = createForm({
      tabbed: true,
      schema: defineSchema({
        tab1: {
          type: 'group',
          page: 'Tab 1',
          schema: { name: { type: 'text' } },
        },
        tab2: {
          type: 'group',
          page: 'Tab 2',
          schema: { email: { type: 'text' } },
        },
      }),
    })

    expect(form$.tabs.page).toBe('tab1')

    await form$.find('tab2').scrollTo()
    await nextTick()

    expect(form$.tabs.page).toBe('tab2')
    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })
})

// ============== el$.focus ===============

describe('el$.focus', () => {
  it('should not scroll when called without arguments', async () => {
    const { form$ } = createForm({
      schema: defineSchema({
        name: { type: 'text' },
      }),
    })

    await form$.find('name').focus()

    expect(scrollIntoViewSpy).not.toHaveBeenCalled()
  })

  it('should scroll before focusing when scroll=true', async () => {
    const { form$ } = createForm({
      schema: defineSchema({
        name: { type: 'text' },
      }),
    })

    await form$.find('name').focus(true)

    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('should not scroll when scroll=false', async () => {
    const { form$ } = createForm({
      schema: defineSchema({
        name: { type: 'text' },
      }),
    })

    await form$.find('name').focus(false)

    expect(scrollIntoViewSpy).not.toHaveBeenCalled()
  })
})

// ===== form submit — without steps ======

describe('form submit — without steps', () => {
  it('should focus and scroll to first invalid element when focusError is true', async () => {
    const { adapter } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          valid: { type: 'text', default: 'ok' },
          name: { type: 'text', rules: 'required' },
        }),
        endpoint: '/api/test',
        focusError: true,
        scrollToError: false,
        scrollTopOn: [],
      },
      { $http: { adapter } }
    )

    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })

  it('should scroll to first invalid element without focusing when focusError is false and scrollToError is true', async () => {
    const { adapter } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        endpoint: '/api/test',
        focusError: false,
        scrollToError: true,
      },
      { $http: { adapter } }
    )

    focusSpy.mockClear()
    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
    expect(focusSpy).not.toHaveBeenCalled()
  })

  it('should scroll to form top on error when both focusError and scrollToError are false', async () => {
    const { adapter } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        endpoint: '/api/test',
        focusError: false,
        scrollToError: false,
        scrollTopOn: ['error'],
      },
      { $http: { adapter } }
    )

    focusSpy.mockClear()
    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
    expect(focusSpy).not.toHaveBeenCalled()
  })

  it('should not scroll at all when focusError, scrollToError are false and scrollTopOn excludes error', async () => {
    const { adapter } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        endpoint: '/api/test',
        focusError: false,
        scrollToError: false,
        scrollTopOn: [],
      },
      { $http: { adapter } }
    )

    focusSpy.mockClear()
    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).not.toHaveBeenCalled()
    expect(focusSpy).not.toHaveBeenCalled()
  })

  it('should scroll to form top on success when scrollTopOn includes success', async () => {
    const { adapter } = mockAdapter({ data: { ok: true } })

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/test',
        scrollTopOn: ['success'],
      },
      { $http: { adapter } }
    )

    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })

  it('should scroll to form top on success when scrollTopOn includes always', async () => {
    const { adapter } = mockAdapter({ data: { ok: true } })

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/test',
        scrollTopOn: ['always'],
      },
      { $http: { adapter } }
    )

    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })

  it('should find the deepest invalid element in a nested group', async () => {
    const { adapter } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          group: {
            type: 'group',
            schema: {
              name: { type: 'text', rules: 'required' },
            },
          },
        }),
        endpoint: '/api/test',
        focusError: true,
        scrollToError: false,
        scrollTopOn: [],
      },
      { $http: { adapter } }
    )

    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })

  it('should find the deepest invalid element in a deeply nested group', async () => {
    const { adapter } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          outer: {
            type: 'group',
            schema: {
              inner: {
                type: 'group',
                schema: {
                  name: { type: 'text', rules: 'required' },
                },
              },
            },
          },
        }),
        endpoint: '/api/test',
        focusError: true,
        scrollToError: false,
        scrollTopOn: [],
      },
      { $http: { adapter } }
    )

    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })
})

// ====== form submit — with steps ========

describe('form submit — with steps', () => {
  describe('next() — current step invalid', () => {
    it('should focus the invalid element in the current step when focusError is true', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', rules: 'required' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
        focusError: true,
        scrollToError: false,
        scrollTopOn: [],
      })

      scrollIntoViewSpy.mockClear()

      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step1')
      expect(scrollIntoViewSpy).toHaveBeenCalled()
    })

    it('should scroll to the invalid element in the current step when scrollToError is true', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', rules: 'required' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
        focusError: false,
        scrollToError: true,
      })

      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step1')
      expect(scrollIntoViewSpy).toHaveBeenCalled()
    })

    it('should scroll to form top on error when both are false and scrollTopOn includes error', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', rules: 'required' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
        focusError: false,
        scrollToError: false,
        scrollTopOn: ['error'],
      })

      focusSpy.mockClear()
      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step1')
      expect(scrollIntoViewSpy).toHaveBeenCalled()
      expect(focusSpy).not.toHaveBeenCalled()
    })

    it('should find the deepest invalid element in a nested group inside a step', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: {
              details: {
                type: 'group',
                schema: { name: { type: 'text', rules: 'required' } },
              },
            },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
        focusError: true,
        scrollToError: false,
        scrollTopOn: [],
      })

      scrollIntoViewSpy.mockClear()

      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step1')
      expect(scrollIntoViewSpy).toHaveBeenCalled()
    })
  })

  describe('next() — successful navigation', () => {
    it('should scroll to form top on successful next when scrollTopOn includes next', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', default: 'John' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
        scrollTopOn: ['next'],
      })

      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step2')
      expect(scrollIntoViewSpy).toHaveBeenCalled()
    })

    it('should not scroll to top on successful next when scrollTopOn does not include next', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', default: 'John' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
        scrollTopOn: [],
      })

      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step2')
      expect(scrollIntoViewSpy).not.toHaveBeenCalled()
    })
  })

  describe('next() — earlier step invalid (validateAllEnabled)', () => {
    it('should focus first invalid element across all steps when focusError is true', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', rules: 'required' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
          step3: {
            type: 'group',
            page: 'Step 3',
            schema: { phone: { type: 'text' } },
          },
        }),
        focusError: true,
        scrollToError: false,
        scrollTopOn: [],
      })

      form$.find('step1.name').update('John')
      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step2')

      form$.find('step1.name').update('')
      await form$.find('step1.name').validate()

      scrollIntoViewSpy.mockClear()

      await form$.steps.next()
      await flushPromises()

      expect(scrollIntoViewSpy).toHaveBeenCalled()
    })

    it('should scroll to first invalid element across all steps when scrollToError is true', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', rules: 'required' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
          step3: {
            type: 'group',
            page: 'Step 3',
            schema: { phone: { type: 'text' } },
          },
        }),
        focusError: false,
        scrollToError: true,
        scrollTopOn: [],
      })

      form$.find('step1.name').update('John')
      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step2')

      form$.find('step1.name').update('')
      await form$.find('step1.name').validate()

      scrollIntoViewSpy.mockClear()

      await form$.steps.next()
      await flushPromises()

      expect(scrollIntoViewSpy).toHaveBeenCalled()
    })
  })

  describe('back()', () => {
    it('should scroll to form top on successful back when scrollTopOn includes back', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', default: 'John' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
        scrollTopOn: ['back'],
      })

      await form$.steps.next()
      await flushPromises()
      expect(form$.steps.page).toBe('step2')

      scrollIntoViewSpy.mockClear()

      await form$.steps.back()
      await flushPromises()

      expect(form$.steps.page).toBe('step1')
      expect(scrollIntoViewSpy).toHaveBeenCalled()
    })

    it('should not scroll to top on back when scrollTopOn does not include back', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', default: 'John' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
        scrollTopOn: [],
      })

      await form$.steps.next()
      await flushPromises()

      scrollIntoViewSpy.mockClear()

      await form$.steps.back()
      await flushPromises()

      expect(form$.steps.page).toBe('step1')
      expect(scrollIntoViewSpy).not.toHaveBeenCalled()
    })
  })
})

// ===== tabs — no auto scroll/focus ======

describe('tabs — no auto scroll/focus', () => {
  it('should not scroll or focus when selecting a tab', async () => {
    const { form$ } = createForm({
      tabbed: true,
      schema: defineSchema({
        tab1: {
          type: 'group',
          page: 'Tab 1',
          schema: { name: { type: 'text', rules: 'required' } },
        },
        tab2: {
          type: 'group',
          page: 'Tab 2',
          schema: { email: { type: 'text' } },
        },
      }),
    })

    focusSpy.mockClear()
    scrollIntoViewSpy.mockClear()

    await form$.tabs.select('tab2')
    await flushPromises()

    expect(form$.tabs.page).toBe('tab2')
    expect(scrollIntoViewSpy).not.toHaveBeenCalled()
    expect(focusSpy).not.toHaveBeenCalled()
  })

  it('should not scroll or focus when selecting a tab with invalid elements', async () => {
    const { form$ } = createForm({
      tabbed: true,
      schema: defineSchema({
        tab1: {
          type: 'group',
          page: 'Tab 1',
          schema: { name: { type: 'text', rules: 'required' } },
        },
        tab2: {
          type: 'group',
          page: 'Tab 2',
          schema: { email: { type: 'text' } },
        },
      }),
    })

    await form$.find('name').validate()

    focusSpy.mockClear()
    scrollIntoViewSpy.mockClear()

    await form$.tabs.select('tab2')
    await flushPromises()

    expect(form$.tabs.page).toBe('tab2')
    expect(scrollIntoViewSpy).not.toHaveBeenCalled()
    expect(focusSpy).not.toHaveBeenCalled()
  })
})

// ==== server-side validation errors =====

describe('server-side validation errors', () => {
  it('should scroll to form top on server error when scrollTopOn includes error', async () => {
    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/test',
        setInvalid: true,
        focusError: true,
        scrollTopOn: ['error'],
      },
      {
        $http: {
          adapter: errorAdapter(422, {
            errors: { name: ['Server says invalid'] },
          }),
        },
      }
    )

    scrollIntoViewSpy.mockClear()

    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
  })

  it('should scroll to the element without focusing when focusError is false and scrollToError is true', async () => {
    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/test',
        setInvalid: true,
        focusError: false,
        scrollToError: true,
      },
      {
        $http: {
          adapter: errorAdapter(422, {
            errors: { name: ['Name is required'] },
          }),
        },
      }
    )

    focusSpy.mockClear()
    scrollIntoViewSpy.mockClear()

    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
    expect(focusSpy).not.toHaveBeenCalled()
  })

  it('should scroll to form top when both are false and scrollTopOn includes error', async () => {
    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/test',
        setInvalid: true,
        focusError: false,
        scrollToError: false,
        scrollTopOn: ['error'],
      },
      {
        $http: {
          adapter: errorAdapter(422, {
            errors: { name: ['Name is required'] },
          }),
        },
      }
    )

    focusSpy.mockClear()
    scrollIntoViewSpy.mockClear()

    await form$.submit()
    await flushPromises()

    expect(scrollIntoViewSpy).toHaveBeenCalled()
    expect(focusSpy).not.toHaveBeenCalled()
  })
})
