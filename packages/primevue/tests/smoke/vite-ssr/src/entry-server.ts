import { renderToString } from 'vue/server-renderer'
import { createApp } from './app'

export async function render() {
  const { app } = createApp()
  return renderToString(app)
}
