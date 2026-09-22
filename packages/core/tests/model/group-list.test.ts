import { vModelAndChange } from '../helpers'
import createCase from './create.group-list'
import runner from './runner'

const template = `
<VfForm ${vModelAndChange('form')}>
  <VfGroup name="container">
    <VfList name="list" ${vModelAndChange('list')}>
      <template #default="{ index }">
        <VfText :name="index" />
      </template>
    </VfList>
    <VfList name="control" :model-value="mvList">
      <template #default="{ index }">
        <VfText :name="index" model-value="baz" />
      </template>
    </VfList>
  </VfGroup>
  <VfList name="sibling" :initial="2">
    <template #default="{ index }">
      <VfText :name="index" model-value="baz" />
    </template>
  </VfList>
</VfForm>
`

const cases = [
  {
    suite: 'NO v-model',
    params: {
      initial: {
        list: [null],
        control: ['foo', 'bar'],
        sibling: ['baz', 'baz'],
      },
      add: {
        list: {
          list: [null, null],
          control: ['foo', 'bar'],
          sibling: ['baz', 'baz'],
        },
      },
      update: {
        form: [
          { list: ['qux', 'quux'] },
          {
            list: ['qux', 'quux'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        container: [
          // Group update affects 'list' and 'control'
          { list: ['qux'], control: ['Qux'] },
          {
            list: ['qux'],
            control: ['Qux'],
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['qux', 'quux'],
          {
            list: ['qux', 'quux'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          // Updates first item in 'list'
          'qux',
          {
            list: ['qux'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
      },
      load: {
        form: [
          {
            list: ['corge', 'grault'],
            control: ['Corge'],
            sibling: ['Grault', 'Garply', 'Waldo'],
          },
          {
            list: ['corge', 'grault'],
            control: ['Corge'],
            sibling: ['Grault', 'Garply', 'Waldo'],
          },
        ],
        container: [
          // Load affects 'list' and 'control'
          {
            list: ['corge', 'grault'],
            control: ['Corge'],
          },
          {
            list: ['corge', 'grault'],
            control: ['Corge'],
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        list: [
          ['corge', 'grault'],
          {
            list: ['corge', 'grault'],
            control: ['foo', 'bar'], // Control unaffected
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        text: [
          // Loads first item in 'list'
          'corge',
          {
            list: ['corge'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        formEmpty: [
          undefined,
          {
            list: [],
            control: [],
            sibling: [],
          },
        ],
        containerEmpty: [
          // Clear affects 'list' and 'control'
          undefined,
          {
            list: [],
            control: [],
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        listEmpty: [
          undefined,
          {
            list: [],
            control: ['foo', 'bar'], // Control unaffected
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        textEmpty: [
          // Clears first item in 'list'
          undefined,
          {
            list: [null],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
      },
      clear: {
        form: {
          list: [],
          control: [],
          sibling: [],
        },
        container: {
          // Clears 'list' and 'control'
          list: [],
          control: [],
          sibling: ['baz', 'baz'], // Sibling unaffected
        },
        list: {
          list: [],
          control: ['foo', 'bar'], // Control unaffected
          sibling: ['baz', 'baz'], // Sibling unaffected
        },
        text: {
          // Clears first item in 'list'
          list: [null],
          control: ['foo', 'bar'],
          sibling: ['baz', 'baz'],
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: { list: ['qux'] }, // Affects list only
      initial: {
        list: ['qux'], // From formVModel
        control: ['foo', 'bar'],
        sibling: ['baz', 'baz'],
      },
      add: {
        list: {
          list: ['qux', null],
          control: ['foo', 'bar'],
          sibling: ['baz', 'baz'],
        },
      },
      update: {
        form: [
          { list: ['quux', 'corge'] },
          {
            list: ['quux', 'corge'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        container: [
          { list: ['quux'], control: ['Quux'] },
          {
            list: ['quux'],
            control: ['Quux'],
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['quux', 'corge'],
          {
            list: ['quux', 'corge'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'quux',
          {
            list: ['quux'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        formVModel: [
          // Needs all top-level elements
          {
            list: ['grault', 'garply'],
            control: ['Grault', 'Garply'],
            sibling: ['Waldo', 'Fred'],
          },
          {
            list: ['grault', 'garply'],
            control: ['Grault', 'Garply'],
            sibling: ['Waldo', 'Fred'],
          },
        ],
      },
      load: {
        form: [
          {
            list: ['plugh', 'xyzzy'],
            control: ['Plugh'],
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
          {
            list: ['plugh', 'xyzzy'],
            control: ['Plugh'],
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
        ],
        container: [
          {
            list: ['thud', 'wibble'],
            control: ['Thud'],
          },
          {
            list: ['thud', 'wibble'],
            control: ['Thud'],
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['wobble', 'wubble'],
          {
            list: ['wobble', 'wubble'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'flob',
          {
            list: ['flob'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        formEmpty: [
          undefined,
          {
            list: [],
            control: [],
            sibling: [],
          },
        ],
        containerEmpty: [
          undefined,
          {
            list: [],
            control: [],
            sibling: ['baz', 'baz'],
          },
        ],
        listEmpty: [
          undefined,
          {
            list: [],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [null],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
      },
      clear: {
        form: {
          list: [],
          control: [],
          sibling: [],
        },
        container: {
          list: [],
          control: [],
          sibling: ['baz', 'baz'],
        },
        list: {
          list: [],
          control: ['foo', 'bar'],
          sibling: ['baz', 'baz'],
        },
        text: {
          list: [null],
          control: ['foo', 'bar'],
          sibling: ['baz', 'baz'],
        },
      },
    },
  },
  {
    suite: 'LIST v-model',
    params: {
      listVModel: ['qux'], // Affects list only
      initial: {
        list: ['qux'], // From listVModel
        control: ['foo', 'bar'],
        sibling: ['baz', 'baz'],
      },
      add: {
        list: {
          list: ['qux', null],
          control: ['foo', 'bar'],
          sibling: ['baz', 'baz'],
        },
      },
      update: {
        form: [
          { list: ['quux', 'corge'] },
          {
            list: ['quux', 'corge'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        container: [
          { list: ['quux'], control: ['Quux'] },
          {
            list: ['quux'],
            control: ['Quux'],
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['quux', 'corge'],
          {
            list: ['quux', 'corge'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'quux',
          {
            list: ['quux'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        input: [
          'quux',
          {
            list: ['quux'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        listVModel: [
          // Only needs the list array
          ['grault', 'garply'],
          {
            list: ['grault', 'garply'],
            control: ['foo', 'bar'], // Control unaffected
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
      },
      load: {
        form: [
          {
            list: ['plugh', 'xyzzy'],
            control: ['Plugh'],
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
          {
            list: ['plugh', 'xyzzy'],
            control: ['Plugh'],
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
        ],
        container: [
          {
            list: ['thud', 'wibble'],
            control: ['Thud'],
          },
          {
            list: ['thud', 'wibble'],
            control: ['Thud'],
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['wobble', 'wubble'],
          {
            list: ['wobble', 'wubble'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'flob',
          {
            list: ['flob'],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        formEmpty: [
          undefined,
          {
            list: [],
            control: [],
            sibling: [],
          },
        ],
        containerEmpty: [
          undefined,
          {
            list: [],
            control: [],
            sibling: ['baz', 'baz'],
          },
        ],
        listEmpty: [
          undefined,
          {
            list: [],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [null],
            control: ['foo', 'bar'],
            sibling: ['baz', 'baz'],
          },
        ],
      },
      clear: {
        form: {
          list: [],
          control: [],
          sibling: [],
        },
        container: {
          list: [],
          control: [],
          sibling: ['baz', 'baz'],
        },
        list: {
          list: [],
          control: ['foo', 'bar'],
          sibling: ['baz', 'baz'],
        },
        text: {
          list: [null],
          control: ['foo', 'bar'],
          sibling: ['baz', 'baz'],
        },
      },
    },
  },
]

runner(
  '<VfForm> / <VfGroup> / <VfList> / <VfText>',
  cases,
  template,
  createCase
)
