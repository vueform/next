import { vModelAndChange } from '../../helpers'
import createCase from './create.list-group'
import runner from './runner'

const template = `
<VfForm ${vModelAndChange('form')}>
  <VfList name="list" ${vModelAndChange('list')}>
    <template #default="{ index }">
      <VfGroup nested :name="index">
        <VfText name="text" />
        <VfText name="control" model-value="foo" />
      </VfGroup>
    </template>
  </VfList>
</VfForm>
`

const cases = [
  {
    suite: 'NO v-model',
    params: {
      initial: {
        list: [{ text: null, control: 'foo' }],
      },
      add: {
        list: {
          list: [
            { text: null, control: 'foo' },
            { text: null, control: 'foo' },
          ],
        },
      },
      update: {
        form: [
          {
            list: [{ text: 'foo' }, { text: 'bar', control: 'baz' }],
          },
          {
            list: [{ text: 'foo' }, { text: 'bar', control: 'baz' }],
          },
        ],
        list: [
          [{ text: 'foo' }, { text: 'bar', control: 'baz' }],
          {
            list: [{ text: 'foo' }, { text: 'bar', control: 'baz' }],
          },
        ],
        container: [
          { text: 'foo' },
          {
            list: [{ text: 'foo', control: 'foo' }],
          },
        ],
        text: [
          'foo',
          {
            list: [{ text: 'foo', control: 'foo' }],
          },
        ],
      },
      load: {
        form: [
          {
            list: [
              { text: 'foo', control: 'Foo' },
              { text: 'bar', control: 'baz' },
            ],
          },
          {
            list: [
              { text: 'foo', control: 'Foo' },
              { text: 'bar', control: 'baz' },
            ],
          },
        ],
        list: [
          [
            { text: 'foo', control: 'Foo' },
            { text: 'bar', control: 'baz' },
          ],
          {
            list: [
              { text: 'foo', control: 'Foo' },
              { text: 'bar', control: 'baz' },
            ],
          },
        ],
        container: [
          {
            text: 'foo',
            control: 'Foo',
          },
          {
            list: [{ text: 'foo', control: 'Foo' }],
          },
        ],
        text: [
          'foo',
          {
            list: [{ text: 'foo', control: 'foo' }],
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
        containerEmpty: [
          undefined,
          {
            list: [{ text: null, control: null }],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [{ text: null, control: 'foo' }],
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
        container: {
          list: [{ text: null, control: null }],
        },
        text: {
          list: [{ text: null, control: 'foo' }],
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: {
        list: [
          { text: 'foo', control: 'bar' },
          { text: 'baz', control: 'foobar' },
        ],
      },
      initial: {
        list: [
          { text: 'foo', control: 'bar' },
          { text: 'baz', control: 'foobar' },
        ],
      },
      add: {
        list: {
          list: [
            { text: 'foo', control: 'bar' },
            { text: 'baz', control: 'foobar' },
            { text: null, control: 'foo' },
          ],
        },
      },
      update: {
        form: [
          {
            list: [{ text: 'bar' }],
          },
          {
            list: [{ text: 'bar' }],
          },
        ],
        list: [
          [
            { text: 'bar', control: 'Bar' },
            { text: 'bar', control: 'Foobar' },
            { text: 'bar', control: 'baz' },
          ],
          {
            list: [
              { text: 'bar', control: 'Bar' },
              { text: 'bar', control: 'Foobar' },
              { text: 'bar', control: 'baz' },
            ],
          },
        ],
        container: [
          { text: 'baz' },
          {
            list: [
              { text: 'baz', control: 'bar' },
              { text: 'baz', control: 'foobar' },
            ],
          },
        ],
        text: [
          'baz',
          {
            list: [
              { text: 'baz', control: 'bar' },
              { text: 'baz', control: 'foobar' },
            ],
          },
        ],
        formVModel: [
          {
            list: [{ text: 'bar', control: 'Bar' }],
          },
          {
            list: [{ text: 'bar', control: 'Bar' }],
          },
        ],
      },
      load: {
        form: [
          {
            list: [{ text: 'Foo', control: 'Bar' }],
          },
          {
            list: [{ text: 'Foo', control: 'Bar' }],
          },
        ],
        list: [
          [
            { text: 'Foo', control: 'Bar' },
            { text: 'Baz', control: null },
          ],
          {
            list: [
              { text: 'Foo', control: 'Bar' },
              { text: 'Baz', control: null },
            ],
          },
        ],
        container: [
          { text: 'Foo', control: null },
          {
            list: [
              { text: 'Foo', control: null },
              { text: 'baz', control: 'foobar' },
            ],
          },
        ],
        text: [
          'Foo',
          {
            list: [
              { text: 'Foo', control: 'bar' },
              { text: 'baz', control: 'foobar' },
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
        containerEmpty: [
          undefined,
          {
            list: [
              { text: null, control: null },
              { text: 'baz', control: 'foobar' },
            ],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [
              { text: null, control: 'bar' },
              { text: 'baz', control: 'foobar' },
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
        container: {
          list: [
            { text: null, control: null },
            { text: 'baz', control: 'foobar' },
          ],
        },
        text: {
          list: [
            { text: null, control: 'bar' },
            { text: 'baz', control: 'foobar' },
          ],
        },
      },
    },
  },
  {
    suite: 'LIST v-model',
    params: {
      listVModel: [
        { text: 'foo', control: 'bar' },
        { text: 'baz', control: 'foobar' },
      ],
      initial: {
        list: [
          { text: 'foo', control: 'bar' },
          { text: 'baz', control: 'foobar' },
        ],
      },
      add: {
        list: {
          list: [
            { text: 'foo', control: 'bar' },
            { text: 'baz', control: 'foobar' },
            { text: null, control: 'foo' },
          ],
        },
      },
      update: {
        form: [
          {
            list: [{ text: 'bar' }],
          },
          {
            list: [{ text: 'bar' }],
          },
        ],
        list: [
          [
            { text: 'bar', control: 'Bar' },
            { text: 'bar', control: 'Foobar' },
            { text: 'bar', control: 'baz' },
          ],
          {
            list: [
              { text: 'bar', control: 'Bar' },
              { text: 'bar', control: 'Foobar' },
              { text: 'bar', control: 'baz' },
            ],
          },
        ],
        container: [
          { text: 'baz' },
          {
            list: [
              { text: 'baz', control: 'bar' },
              { text: 'baz', control: 'foobar' },
            ],
          },
        ],
        text: [
          'baz',
          {
            list: [
              { text: 'baz', control: 'bar' },
              { text: 'baz', control: 'foobar' },
            ],
          },
        ],
        listVModel: [
          [{ text: 'bar', control: 'Bar' }],
          {
            list: [{ text: 'bar', control: 'Bar' }],
          },
        ],
      },
      load: {
        form: [
          {
            list: [{ text: 'Foo', control: 'Bar' }],
          },
          {
            list: [{ text: 'Foo', control: 'Bar' }],
          },
        ],
        list: [
          [
            { text: 'Foo', control: 'Bar' },
            { text: 'Baz', control: null },
          ],
          {
            list: [
              { text: 'Foo', control: 'Bar' },
              { text: 'Baz', control: null },
            ],
          },
        ],
        container: [
          { text: 'Foo', control: null },
          {
            list: [
              { text: 'Foo', control: null },
              { text: 'baz', control: 'foobar' },
            ],
          },
        ],
        text: [
          'Foo',
          {
            list: [
              { text: 'Foo', control: 'bar' },
              { text: 'baz', control: 'foobar' },
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
        containerEmpty: [
          undefined,
          {
            list: [
              { text: null, control: null },
              { text: 'baz', control: 'foobar' },
            ],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [
              { text: null, control: 'bar' },
              { text: 'baz', control: 'foobar' },
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
        container: {
          list: [
            { text: null, control: null },
            { text: 'baz', control: 'foobar' },
          ],
        },
        text: {
          list: [
            { text: null, control: 'bar' },
            { text: 'baz', control: 'foobar' },
          ],
        },
      },
    },
  },
]

runner(
  '<VfForm> / <VfList> / <VfGroup nested> / <VfText>',
  cases,
  template,
  createCase
)
