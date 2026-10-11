import { createContext } from '@vueform/core'
import { createApp, defineComponent, h } from 'vue'

const mountApp = (root: any) => {
  const el = document.createElement('div')
  const app = createApp(root)
  app.mount(el)
  return app
}

describe('createContext', () => {
  it('should resolve a context provided by the same component during setup', () => {
    const [useCtx, provideCtx] = createContext<{ v: number }>('same-instance')
    let resolved: any

    mountApp(
      defineComponent({
        setup() {
          provideCtx({ v: 1 })
          resolved = useCtx()
          return () => h('div')
        },
      })
    )

    expect(resolved).toEqual({ v: 1 })
  })

  it('should resolve a context provided by an ancestor component', () => {
    const [useCtx, provideCtx] = createContext<string>('ancestor')
    let resolved: any

    const Child = defineComponent({
      setup() {
        resolved = useCtx()
        return () => h('div')
      },
    })

    mountApp(
      defineComponent({
        setup() {
          provideCtx('from-parent')
          return () => h(Child)
        },
      })
    )

    expect(resolved).toBe('from-parent')
  })

  it('should prefer own provided context over an ancestor one', () => {
    const [useCtx, provideCtx] = createContext<string>('shadowing')
    let resolved: any

    const Child = defineComponent({
      setup() {
        provideCtx('from-child')
        resolved = useCtx()
        return () => h('div')
      },
    })

    mountApp(
      defineComponent({
        setup() {
          provideCtx('from-parent')
          return () => h(Child)
        },
      })
    )

    expect(resolved).toBe('from-child')
  })

  it('should not leak locally provided context to sibling components', () => {
    const [useCtx, provideCtx] = createContext<string>('sibling')
    let resolved: any = 'initial'

    const Provider = defineComponent({
      setup() {
        provideCtx('from-sibling')
        return () => h('div')
      },
    })

    const Sibling = defineComponent({
      setup() {
        resolved = useCtx()
        return () => h('div')
      },
    })

    mountApp(
      defineComponent({
        setup() {
          return () => [h(Provider), h(Sibling)]
        },
      })
    )

    expect(resolved).toBe(undefined)
  })

  it('should resolve an app-level provided context', () => {
    const [useCtx, provideCtx] = createContext<string>('app-level')
    let resolved: any

    const Root = defineComponent({
      setup() {
        resolved = useCtx()
        return () => h('div')
      },
    })

    const el = document.createElement('div')
    const app = createApp(Root)
    provideCtx('from-app', app)
    app.mount(el)

    expect(resolved).toBe('from-app')
  })

  it('should return undefined when nothing was provided', () => {
    const [useCtx] = createContext<string>('missing')
    let resolved: any = 'initial'

    mountApp(
      defineComponent({
        setup() {
          resolved = useCtx()
          return () => h('div')
        },
      })
    )

    expect(resolved).toBe(undefined)
  })

  it('should return the provided context from provideContext', () => {
    const [, provideCtx] = createContext<{ v: number }>('return-value')
    let returned: any

    mountApp(
      defineComponent({
        setup() {
          returned = provideCtx({ v: 42 })
          return () => h('div')
        },
      })
    )

    expect(returned).toEqual({ v: 42 })
  })
})
