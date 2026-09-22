<script setup lang="ts">
import { Repl, useStore, useVueImportMap } from '@vue/repl'
import CodeMirror from '@vue/repl/codemirror-editor'
import '@vue/repl/style.css'
import { useData } from 'vitepress'
import { ref, watchEffect } from 'vue'

const { isDark } = useData()

const defaultApp = `<template>
  <VfForm>
    <VfText name="name" label="Name" />
    <VfText name="email" label="Email" rules="required|email" />
    <VfTextarea name="message" label="Message" />
    <VfButton name="submit" text="Submit" action="submit" />
  </VfForm>
</template>
`

const { importMap, vueVersion } = useVueImportMap({
  runtimeDev:
    'https://cdn.jsdelivr.net/npm/@vue/runtime-dom@3.5/dist/runtime-dom.esm-browser.js',
  runtimeProd:
    'https://cdn.jsdelivr.net/npm/@vue/runtime-dom@3.5/dist/runtime-dom.esm-browser.prod.js',
  serverRenderer:
    'https://cdn.jsdelivr.net/npm/@vue/server-renderer@3.5/dist/server-renderer.esm-browser.js',
})

const store = useStore(
  {
    builtinImportMap: importMap,
    vueVersion,
    showOutput: ref(false),
    outputMode: ref('preview' as const),
    template: ref({
      welcomeSFC: defaultApp,
      newSFC: '<template>\n  \n</template>\n',
    }),
  },
  location.hash
)

watchEffect(() => history.replaceState({}, '', store.serialize()))

const previewOptions = {
  headHTML: `
    <link rel="stylesheet" href="/playground/origin.css">
    <style>body { padding: 16px; }</style>
  `,
  customCode: {
    importCode: `
      import * as Vue from 'vue'
      window.Vue = Vue
      await new Promise(resolve => {
        const s = document.createElement('script')
        s.src = '/playground/origin.global.js'
        s.onload = resolve
        document.head.appendChild(s)
      })
    `,
    useCode: `app.use(Vueform.createVueform({ darkMode: '.dark' }))`,
  },
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const copied = ref(false)
</script>

<template>
  <div class="vp-playground">
    <div class="vp-playground-toolbar">
      <button class="vp-playground-share" @click="copyLink">
        {{ copied ? 'Copied!' : 'Share' }}
      </button>
    </div>
    <Repl
      :store="store"
      :editor="CodeMirror"
      :theme="isDark ? 'dark' : 'light'"
      :showCompileOutput="false"
      :showImportMap="false"
      :showTsConfig="false"
      :clearConsole="false"
      :previewOptions="previewOptions"
    />
  </div>
</template>

<style scoped>
.vp-playground {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--vp-nav-height) - 32px);
}

.vp-playground-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.vp-playground-share {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.vp-playground-share:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.vp-playground :deep(.vue-repl) {
  flex: 1;
  height: 100% !important;
}
</style>
