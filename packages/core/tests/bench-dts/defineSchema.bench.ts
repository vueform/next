import { bench } from '@ark/attest'
import '@vueform/core/components'
import '@vueform/core/modules'
import '@vueform/core/rules'
import '@vueform/core/tokens'
import '@vueform/core/locales'
import { defineSchema } from '@vueform/core'

bench.baseline(() => defineSchema({}))

bench('single text element', () => {
  defineSchema({ name: { type: 'text', label: 'Name' } })
}).types([1317, 'instantiations'])

bench('ten mixed elements', () => {
  defineSchema({
    a: { type: 'text' },
    b: { type: 'textarea' },
    c: { type: 'checkbox' },
    d: { type: 'select', items: ['x', 'y'] },
    e: { type: 'radios', items: { one: 'One' } },
    f: { type: 'hidden' },
    g: { type: 'list', element: { type: 'text' } },
    h: { type: 'group', schema: { inner: { type: 'text' } } },
    i: { type: 'grid' },
    j: { type: 'button' },
  })
}).types([14150, 'instantiations'])
