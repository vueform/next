import { reactive, ref } from 'vue'

export type OutlineTab = {
  title: string
  slug: string
  dropdown?: boolean
}

const activeTabSlug = ref<string | null>(null)
const tabs = reactive<OutlineTab[]>([])

export function useActiveTab() {
  return { activeTabSlug, tabs }
}
