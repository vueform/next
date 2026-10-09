import { toVdomRenderableSlot } from '@vueform/core'
import {
  defineComponent,
  h,
  ref,
  type Component,
  type ComponentPublicInstance,
  type Slot,
} from 'vue'

declare const __VUEFORM_VAPOR__: boolean | undefined

function componentName(component: Component): string {
  const record = component as { name?: string; __name?: string }
  return record.name || record.__name || 'Anonymous'
}

const isVapor = typeof __VUEFORM_VAPOR__ !== 'undefined' && __VUEFORM_VAPOR__

/**
 * Wrap a PrimeVue (VDOM / Options API) component so it can be used safely from
 * vapor-compiled Vueform SFCs.
 *
 * In the main (VDOM) build this is a no-op and returns `component` unchanged —
 * no extra instance layer. In the vapor build / vapor playground / vapor tests
 * (`__VUEFORM_VAPOR__`) it returns a VDOM `defineComponent` + `h()` host: vapor
 * interop mounts the bridge, and the bridge renders PrimeVue in a pure VDOM
 * tree where props, events, slots, and instance methods work normally.
 *
 * Direct vapor → PrimeVue nesting has known interop gaps: props from Options
 * API `extends` chains (e.g. `fluid`) fall through as DOM attributes, some
 * components render as `<!--[object Object]-->`, and tags like `<Button>` /
 * `<Select>` collide with HTML elements under Vapor's case-insensitive check.
 *
 * Parent template refs receive a Proxy of the inner PrimeVue instance so calls
 * like `input.value.show()` keep working. The proxy is marked `__v_skip` so
 * Vue's reactivity traverse does not walk the Options API instance graph (which
 * is circular and overflows the stack).
 *
 * Template aliases such as `VdomPrimeSelect` still resolve correctly in VDOM
 * mode — resolution uses the script binding, not `component.name`.
 *
 * @param component The PrimeVue component to wrap.
 * @param name The name of the bridge component, defaulting to the wrapped
 * component's name prefixed with `Pv`.
 */
export function vdomPrime<C extends Component>(
  component: C,
  name = `Pv${componentName(component)}`
): C {
  if (!isVapor) return component

  // Cast: the vapor host is a drop-in stand-in for `C` so template ref /
  // prop typing stays that of the wrapped PrimeVue component.
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots, expose }) {
      const inner = ref<ComponentPublicInstance | null>(null)

      expose(
        new Proxy(
          { __v_skip: true },
          {
            get(target, prop, receiver) {
              if (prop === '__v_skip') return true
              const inst = inner.value
              if (!inst) return Reflect.get(target, prop, receiver)
              const value = Reflect.get(inst, prop, inst)
              return typeof value === 'function' ? value.bind(inst) : value
            },
            has(_target, prop) {
              if (prop === '__v_skip') return true
              return !!inner.value && Reflect.has(inner.value, prop)
            },
            ownKeys() {
              return inner.value
                ? ['__v_skip', ...Reflect.ownKeys(inner.value)]
                : ['__v_skip']
            },
            getOwnPropertyDescriptor(target, prop) {
              if (prop === '__v_skip') {
                return Object.getOwnPropertyDescriptor(target, prop)
              }
              if (!inner.value) return undefined
              return {
                configurable: true,
                enumerable: true,
                value: Reflect.get(inner.value, prop, inner.value),
              }
            },
          }
        )
      )

      return () => {
        const vdomSlots: Record<string, Slot> = {}
        for (const slotName in slots) {
          const slot = slots[slotName]
          if (typeof slot === 'function') {
            vdomSlots[slotName] = toVdomRenderableSlot(slotName, slot)
          }
        }

        return h(
          component as Component,
          {
            ...attrs,
            ref: inner,
          },
          vdomSlots
        )
      }
    },
  }) as C
}
