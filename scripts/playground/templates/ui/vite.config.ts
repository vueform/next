import vue from '@vitejs/plugin-vue'
import { vueformDev } from '../../vite.dev'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), vueformDev('ui')],
})
