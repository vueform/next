import '#shorthands'
import VfSlider, { type VfSliderEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfSlider: VfSliderEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfSlider: typeof VfSlider
  }
}
