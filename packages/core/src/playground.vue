<!-- <script setup lang="ts" generic="TSchema extends FormSchema = any">
import { useAttrs } from 'vue'
import { type FormSchema } from '@/types'

export type DefineProps<T, BKeys extends keyof T> = Readonly<T> & {
  readonly [K in BKeys]-?: boolean
}

export type MappedOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}
export type NotUndefined<T> = T extends undefined ? never : T
export type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>
}
export type NativeType = null | undefined | number | string | boolean | symbol | Function
export type InferDefault<P, T> = ((props: P) => T & {}) | (T extends NativeType ? T : never)
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

export type PropsWithDefaults<T, Defaults extends InferDefaults<T>, BKeys extends keyof T> = T extends unknown
  ? Readonly<MappedOmit<T, keyof Defaults>> & {
      readonly [K in keyof Defaults as K extends keyof T ? K : never]-?: K extends keyof T
        ? Defaults[K] extends undefined
          ? IfAny<Defaults[K], NotUndefined<T[K]>, T[K]>
          : NotUndefined<T[K]>
        : never
    } & {
      readonly [K in BKeys]-?: K extends keyof Defaults
        ? Defaults[K] extends undefined
          ? boolean | undefined
          : boolean
        : boolean
    }
  : never

export interface VfFormProps<TSchema extends FormSchema = any> {
  schema?: TSchema
  parts?: {
    root?: object
    errors?: any
    errorList?: any
    error?: any
  }
  'part:root'?: object
  'part:errors'?: any
  'part:errorList'?: any
  'part:error'?: any
}

type PropsInput<T extends Record<string, any>> = Readonly<T>

function useProps<
  T extends Record<string, any>,
  Defaults extends InferDefaults<T> = InferDefaults<T>,
  BKeys extends keyof T = never,
>(props: PropsInput<T>, defaults: Defaults = {} as Defaults): PropsWithDefaults<T, Defaults, BKeys> {
  const attrs = useAttrs()

  return new Proxy(props, {
    get(target: any, key: string) {
      if (typeof key !== 'string') {
        return Reflect.get(target, key)
      }

      // 1. `parts` should resolve from attrs first
      if (key === 'parts') {
        return Object.assign(
          {},
          target[key],
          Object.keys(attrs).reduce(
            (attrParts, key) => {
              if (key.startsWith('part:')) {
                attrParts[key.replace('part:', '')] = attrs[key]
              }

              return attrParts
            },
            {} as Record<string, any>
          )
        )
      }

      // ...

      // 8. Hardcoded default
      if (key in defaults) {
        return (defaults as any)[key]
      }

      return undefined
    },
  }) as any
}

const baseProps = defineProps<VfFormProps<TSchema>>()
const effectiveProps = useProps(baseProps, {})

const partRoot = effectiveProps['part:root'] // works, no TS error

defineExpose({
  effectiveProps,
})
</script>

<template>
  Works
  <div v-bind="$props['part:root']"></div>
  Works
  <div v-bind="baseProps['part:root']"></div>
  TS error
  <div v-bind="effectiveProps"></div>
</template> -->

<!--
So I have this file.

My issue is that in the template I have this TS error for props.root:
Element implicitly has an 'any' type because expression of type '"part:root"' can't be used to index type 'unknown'.
  Property 'part:root' does not exist on type 'unknown'

How can I solve this while keeping DX a priority (possible no extra helpers, no explicit generic passing to useProps, etc).

If I use const baseProps = defineProps<VfFormProps>() without generic, it works, but I need to use it
-->
