import type {
  DefineRegistryEntry,
  EntryLanguagesOf,
  EntryTranslateOf,
} from '#core'
import type {
  VfTestClasses,
  VfTestContext,
  VfTestEmits,
  VfTestParts,
  VfTestProps,
  VfTestSlots,
} from './VfTest.vue'

type EntryProps<TEntry> = VfTestProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfTest: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfTestEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
      VfTestSlots,
      VfTestParts,
      VfTestClasses,
      VfTestContext<EntryProps<TEntry>>
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfTest: (typeof import('./VfTest.vue'))['default']
  }
}
