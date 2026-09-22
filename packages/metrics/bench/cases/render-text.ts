import { defineCase } from '../case'
import { textSchema } from '../schemas'

export default defineCase({
  id: 'render-text',
  label: 'Render N Text Elements',
  description: 'Mounts a form whose schema contains N text elements.',
  ns: [100, 250, 500, 750, 1000],
  run: ({ mount, n }) => mount({ schema: textSchema(n) }),
})
