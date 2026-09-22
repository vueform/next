import { vModelAndChange } from '../../helpers'
import createCase from './create.list-list'
import runner from './runner'

const template = `
<VfForm ${vModelAndChange('form')}>
  <VfList name="list" ${vModelAndChange('list')}>
    <template #default="{ index }">
      <VfList :name="index" @change="onChangeSublist">
        <template #default="{ index }">
          <VfText :name="index" @change="onChangeText" />
        </template>
      </VfList>
    </template>
  </VfList>
</VfForm>
`

const cases = [
  {
    suite: 'NO v-model',
    params: {
      initial: {
        list: [[null]],
      },
      add: {
        list: {
          list: [[null], [null]],
        },
        sublist: {
          list: [[null, null]],
        },
      },
      update: {
        form: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        list: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        sublist: [
          ['foo', 'bar'],
          {
            list: [['foo', 'bar']],
          },
        ],
        text: [
          'foo',
          {
            list: [['foo']],
          },
        ],
      },
      load: {
        form: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        list: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        sublist: [
          ['foo', 'bar'],
          {
            list: [['foo', 'bar']],
          },
        ],
        text: [
          'foo',
          {
            list: [['foo']],
          },
        ],
        formEmpty: [
          undefined,
          {
            list: [],
          },
        ],
        listEmpty: [
          undefined,
          {
            list: [],
          },
        ],
        sublistEmpty: [
          undefined,
          {
            list: [[]],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [[null]],
          },
        ],
      },
      clear: {
        form: {
          list: [],
        },
        list: {
          list: [],
        },
        sublist: {
          list: [[]],
        },
        text: {
          list: [[null]],
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: {
        list: [
          ['Foo', 'Bar'],
          ['Baz', 'Foobar'],
          ['Qux', 'Quux'],
        ],
      },
      initial: {
        list: [
          ['Foo', 'Bar'],
          ['Baz', 'Foobar'],
          ['Qux', 'Quux'],
        ],
      },
      add: {
        list: {
          list: [['Foo', 'Bar'], ['Baz', 'Foobar'], ['Qux', 'Quux'], [null]],
        },
        sublist: {
          list: [
            ['Foo', 'Bar', null],
            ['Baz', 'Foobar'],
            ['Qux', 'Quux'],
          ],
        },
      },
      update: {
        form: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        list: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        sublist: [
          ['foo', 'bar'],
          {
            list: [
              ['foo', 'bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        text: [
          'foo',
          {
            list: [
              ['foo', 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        formVModel: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
      },
      load: {
        form: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        list: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        sublist: [
          ['foo', 'bar'],
          {
            list: [
              ['foo', 'bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        text: [
          'foo',
          {
            list: [
              ['foo', 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        formEmpty: [
          undefined,
          {
            list: [],
          },
        ],
        listEmpty: [
          undefined,
          {
            list: [],
          },
        ],
        sublistEmpty: [
          undefined,
          {
            list: [[], ['Baz', 'Foobar'], ['Qux', 'Quux']],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [
              [null, 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
      },
      clear: {
        form: {
          list: [],
        },
        list: {
          list: [],
        },
        sublist: {
          list: [[], ['Baz', 'Foobar'], ['Qux', 'Quux']],
        },
        text: {
          list: [
            [null, 'Bar'],
            ['Baz', 'Foobar'],
            ['Qux', 'Quux'],
          ],
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: {
        list: [
          ['Foo', 'Bar'],
          ['Baz', 'Foobar'],
          ['Qux', 'Quux'],
        ],
      },
      initial: {
        list: [
          ['Foo', 'Bar'],
          ['Baz', 'Foobar'],
          ['Qux', 'Quux'],
        ],
      },
      add: {
        list: {
          list: [['Foo', 'Bar'], ['Baz', 'Foobar'], ['Qux', 'Quux'], [null]],
        },
        sublist: {
          list: [
            ['Foo', 'Bar', null],
            ['Baz', 'Foobar'],
            ['Qux', 'Quux'],
          ],
        },
      },
      update: {
        form: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        list: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        sublist: [
          ['foo', 'bar'],
          {
            list: [
              ['foo', 'bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        text: [
          'foo',
          {
            list: [
              ['foo', 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        formVModel: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
      },
      load: {
        form: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        list: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        sublist: [
          ['foo', 'bar'],
          {
            list: [
              ['foo', 'bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        text: [
          'foo',
          {
            list: [
              ['foo', 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        formEmpty: [
          undefined,
          {
            list: [],
          },
        ],
        listEmpty: [
          undefined,
          {
            list: [],
          },
        ],
        sublistEmpty: [
          undefined,
          {
            list: [[], ['Baz', 'Foobar'], ['Qux', 'Quux']],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [
              [null, 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
      },
      clear: {
        form: {
          list: [],
        },
        list: {
          list: [],
        },
        sublist: {
          list: [[], ['Baz', 'Foobar'], ['Qux', 'Quux']],
        },
        text: {
          list: [
            [null, 'Bar'],
            ['Baz', 'Foobar'],
            ['Qux', 'Quux'],
          ],
        },
      },
    },
  },
  {
    suite: 'LIST v-model',
    params: {
      listVModel: [
        ['Foo', 'Bar'],
        ['Baz', 'Foobar'],
        ['Qux', 'Quux'],
      ],
      initial: {
        list: [
          ['Foo', 'Bar'],
          ['Baz', 'Foobar'],
          ['Qux', 'Quux'],
        ],
      },
      add: {
        list: {
          list: [['Foo', 'Bar'], ['Baz', 'Foobar'], ['Qux', 'Quux'], [null]],
        },
        sublist: {
          list: [
            ['Foo', 'Bar', null],
            ['Baz', 'Foobar'],
            ['Qux', 'Quux'],
          ],
        },
      },
      update: {
        form: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        list: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        sublist: [
          ['foo', 'bar'],
          {
            list: [
              ['foo', 'bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        text: [
          'foo',
          {
            list: [
              ['foo', 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        listVModel: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
      },
      load: {
        form: [
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        list: [
          [
            ['foo', 'bar'],
            ['baz', 'foobar'],
          ],
          {
            list: [
              ['foo', 'bar'],
              ['baz', 'foobar'],
            ],
          },
        ],
        sublist: [
          ['foo', 'bar'],
          {
            list: [
              ['foo', 'bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        text: [
          'foo',
          {
            list: [
              ['foo', 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
        formEmpty: [
          undefined,
          {
            list: [],
          },
        ],
        listEmpty: [
          undefined,
          {
            list: [],
          },
        ],
        sublistEmpty: [
          undefined,
          {
            list: [[], ['Baz', 'Foobar'], ['Qux', 'Quux']],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [
              [null, 'Bar'],
              ['Baz', 'Foobar'],
              ['Qux', 'Quux'],
            ],
          },
        ],
      },
      clear: {
        form: {
          list: [],
        },
        list: {
          list: [],
        },
        sublist: {
          list: [[], ['Baz', 'Foobar'], ['Qux', 'Quux']],
        },
        text: {
          list: [
            [null, 'Bar'],
            ['Baz', 'Foobar'],
            ['Qux', 'Quux'],
          ],
        },
      },
    },
  },
]

runner('<VfForm> / <VfList> / <VfList> / <VfText>', cases, template, createCase)
