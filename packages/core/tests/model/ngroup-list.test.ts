import { vModelAndChange } from '../helpers'
import createCase from './create.group-list'
import runner from './runner'

const template = `
<VfForm ${vModelAndChange('form')}>
  <VfGroup nested name="container" ${vModelAndChange('container')}>
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
        container: {
          list: [null],
          control: ['foo', 'bar'],
        },
        sibling: ['baz', 'baz'],
      },
      add: {
        list: {
          container: {
            list: [null, null],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
      },
      update: {
        form: [
          { container: { list: ['foo', 'bar'] } },
          {
            container: {
              list: ['foo', 'bar'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        container: [
          { list: ['foo', 'bar'] },
          {
            container: {
              list: ['foo', 'bar'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['foo', 'bar'],
          {
            container: {
              list: ['foo', 'bar'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'foo',
          {
            container: {
              list: ['foo'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              list: ['foo', 'bar'],
              control: ['Foo'],
            },
            sibling: ['Bar', 'Bar', 'Bar'],
          },
          {
            container: {
              list: ['foo', 'bar'],
              control: ['Foo'],
            },
            sibling: ['Bar', 'Bar', 'Bar'],
          },
        ],
        container: [
          {
            list: ['foo', 'bar'],
            control: ['Foo'],
          },
          {
            container: {
              list: ['foo', 'bar'],
              control: ['Foo'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['foo', 'bar'],
          {
            container: {
              list: ['foo', 'bar'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'foo',
          {
            container: {
              list: ['foo'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: [],
            },
            sibling: [],
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: [],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        listEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              list: [null],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
      },
      clear: {
        form: {
          container: {
            list: [],
            control: [],
          },
          sibling: [],
        },
        container: {
          container: {
            list: [],
            control: [],
          },
          sibling: ['baz', 'baz'],
        },
        list: {
          container: {
            list: [],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
        text: {
          container: {
            list: [null],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: { container: { list: ['qux'] } },
      initial: {
        container: {
          list: ['qux'],
          control: ['foo', 'bar'],
        },
        sibling: ['baz', 'baz'],
      },
      add: {
        list: {
          container: {
            list: ['qux', null],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
      },
      update: {
        form: [
          { container: { list: ['quux', 'corge'] } },
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        container: [
          { list: ['quux', 'corge'] },
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['quux', 'corge'],
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          // Updates the first text element in the list
          'quux',
          {
            container: {
              list: ['quux'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        formVModel: [
          {
            container: {
              list: ['grault', 'garply'],
              control: ['Grault', 'Garply'],
            },
            sibling: ['Waldo', 'Fred'],
          },
          {
            container: {
              list: ['grault', 'garply'],
              control: ['Grault', 'Garply'],
            },
            sibling: ['Waldo', 'Fred'],
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              list: ['plugh', 'xyzzy'],
              control: ['Plugh'],
            },
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
          {
            container: {
              list: ['plugh', 'xyzzy'],
              control: ['Plugh'],
            },
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
        ],
        container: [
          {
            list: ['thud', 'wibble'],
            control: ['Thud'],
          },
          {
            container: {
              list: ['thud', 'wibble'],
              control: ['Thud'],
            },
            sibling: ['baz', 'baz'], // Sibling unaffected by container load
          },
        ],
        list: [
          ['wobble', 'wubble'],
          {
            container: {
              list: ['wobble', 'wubble'],
              control: ['foo', 'bar'], // Control unaffected by list load
            },
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          // Loads the first text element in the list
          'flob',
          {
            container: {
              list: ['flob'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: [],
            },
            sibling: [],
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: [],
            },
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        listEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: ['foo', 'bar'], // Control unaffected
            },
            sibling: ['baz', 'baz'],
          },
        ],
        textEmpty: [
          // Clears the first text element in the list
          undefined,
          {
            container: {
              list: [null], // Only first item cleared
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
      },
      clear: {
        form: {
          container: {
            list: [],
            control: [],
          },
          sibling: [],
        },
        container: {
          container: {
            list: [],
            control: [],
          },
          sibling: ['baz', 'baz'], // Sibling unaffected
        },
        list: {
          container: {
            list: [],
            control: ['foo', 'bar'], // Control unaffected
          },
          sibling: ['baz', 'baz'],
        },
        text: {
          // Clears only the first text element
          container: {
            list: [null],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
      },
    },
  },
  {
    suite: 'CONTAINER v-model',
    params: {
      containerVModel: { list: ['qux'] }, // Only provides value for list within container
      initial: {
        container: {
          list: ['qux'], // from containerVModel
          control: ['foo', 'bar'], // from element modelValue
        },
        sibling: ['baz', 'baz'],
      },
      add: {
        list: {
          container: {
            list: ['qux', null],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
      },
      update: {
        form: [
          { container: { list: ['quux', 'corge'] } },
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        container: [
          { list: ['quux', 'corge'] },
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['quux', 'corge'],
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'quux',
          {
            container: {
              list: ['quux'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        containerVModel: [
          // Must provide full structure for container
          {
            list: ['grault', 'garply'],
            control: ['Grault', 'Garply'],
          },
          {
            container: {
              // Expected form data reflects the update
              list: ['grault', 'garply'],
              control: ['Grault', 'Garply'],
            },
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              list: ['plugh', 'xyzzy'],
              control: ['Plugh'],
            },
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
          {
            container: {
              list: ['plugh', 'xyzzy'],
              control: ['Plugh'],
            },
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
        ],
        container: [
          // Loads into container object
          {
            list: ['thud', 'wibble'],
            control: ['Thud'],
          },
          {
            container: {
              // Expected form data
              list: ['thud', 'wibble'],
              control: ['Thud'],
            },
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        list: [
          ['wobble', 'wubble'],
          {
            container: {
              list: ['wobble', 'wubble'],
              control: ['foo', 'bar'], // Control unaffected
            },
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'flob',
          {
            container: {
              list: ['flob'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: [],
            },
            sibling: [],
          },
        ],
        containerEmpty: [
          // Clears container
          undefined,
          {
            container: {
              list: [],
              control: [],
            },
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        listEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: ['foo', 'bar'], // Control unaffected
            },
            sibling: ['baz', 'baz'],
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              list: [null],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
      },
      clear: {
        form: {
          container: {
            list: [],
            control: [],
          },
          sibling: [],
        },
        container: {
          // Clears container children
          container: {
            list: [],
            control: [],
          },
          sibling: ['baz', 'baz'], // Sibling unaffected
        },
        list: {
          container: {
            list: [],
            control: ['foo', 'bar'], // Control unaffected
          },
          sibling: ['baz', 'baz'],
        },
        text: {
          // Clears only the first text element
          container: {
            list: [null],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
      },
    },
  },
  {
    suite: 'LIST v-model',
    params: {
      listVModel: ['qux'], // Provides value directly for list
      initial: {
        container: {
          list: ['qux'], // from listVModel
          control: ['foo', 'bar'],
        },
        sibling: ['baz', 'baz'],
      },
      add: {
        list: {
          container: {
            list: ['qux', null],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
      },
      update: {
        form: [
          { container: { list: ['quux', 'corge'] } },
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        container: [
          { list: ['quux', 'corge'] },
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          ['quux', 'corge'],
          {
            container: {
              list: ['quux', 'corge'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        text: [
          'quux',
          {
            container: {
              list: ['quux'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        listVModel: [
          // Update v-model on list
          ['grault', 'garply'],
          {
            container: {
              // Expected form data reflects the update
              list: ['grault', 'garply'],
              control: ['foo', 'bar'], // Control unaffected
            },
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              list: ['plugh', 'xyzzy'],
              control: ['Plugh'],
            },
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
          {
            container: {
              list: ['plugh', 'xyzzy'],
              control: ['Plugh'],
            },
            sibling: ['Xyzzy', 'Xyzzy', 'Xyzzy'],
          },
        ],
        container: [
          {
            list: ['thud', 'wibble'],
            control: ['Thud'],
          },
          {
            container: {
              list: ['thud', 'wibble'],
              control: ['Thud'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        list: [
          // Load list element
          ['wobble', 'wubble'],
          {
            container: {
              list: ['wobble', 'wubble'],
              control: ['foo', 'bar'], // Control unaffected
            },
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        text: [
          'flob',
          {
            container: {
              list: ['flob'],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: [],
            },
            sibling: [],
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              list: [],
              control: [],
            },
            sibling: ['baz', 'baz'],
          },
        ],
        listEmpty: [
          // Clear list element
          undefined,
          {
            container: {
              list: [],
              control: ['foo', 'bar'], // Control unaffected
            },
            sibling: ['baz', 'baz'], // Sibling unaffected
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              list: [null],
              control: ['foo', 'bar'],
            },
            sibling: ['baz', 'baz'],
          },
        ],
      },
      clear: {
        form: {
          container: {
            list: [],
            control: [],
          },
          sibling: [],
        },
        container: {
          container: {
            list: [],
            control: [],
          },
          sibling: ['baz', 'baz'],
        },
        list: {
          // Clears list element
          container: {
            list: [],
            control: ['foo', 'bar'], // Control unaffected
          },
          sibling: ['baz', 'baz'], // Sibling unaffected
        },
        text: {
          // Clears only the first text element
          container: {
            list: [null],
            control: ['foo', 'bar'],
          },
          sibling: ['baz', 'baz'],
        },
      },
    },
  },
]

runner(
  '<VfForm> / <VfGroup nested> / <VfList> / <VfText>',
  cases,
  template,
  createCase
)
