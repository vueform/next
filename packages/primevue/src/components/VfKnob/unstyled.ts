import '#shorthands'
import VfKnob, { type VfKnobEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfKnob: VfKnobEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfKnob: typeof VfKnob
  }
}
