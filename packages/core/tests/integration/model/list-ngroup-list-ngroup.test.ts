import { vModelAndChange } from '../../helpers'
import createCase from './create.list-ngroup-list-ngroup'
import runner from './runner'

const template = `
<VfForm ${vModelAndChange('form')}>
  <VfList name="list" ${vModelAndChange('list')}>
    <template #default="{ index }">
      <VfGroup nested :name="index" @change="onChangeListContainer">
        <VfList name="sublist" @change="onChangeSublist">
          <template #default="{ index }">
            <VfGroup nested :name="index" @change="onChangeSublistContainer">
              <VfText name="text" @change="onChangeText" />
              <VfText name="subcontrol" model-value="foo" />
            </VfGroup>
          </template>
        </VfList>
        <VfText name="control" model-value="bar" />
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
        list: [
          {
            sublist: [{ text: null, subcontrol: 'foo' }],
            control: 'bar',
          },
        ],
      },
      add: {
        list: {
          list: [
            {
              sublist: [{ text: null, subcontrol: 'foo' }],
              control: 'bar',
            },
            {
              sublist: [{ text: null, subcontrol: 'foo' }],
              control: 'bar',
            },
          ],
        },
        sublist: {
          list: [
            {
              sublist: [
                { text: null, subcontrol: 'foo' },
                { text: null, subcontrol: 'foo' },
              ],
              control: 'bar',
            },
          ],
        },
      },
      update: {
        form: [
          {
            list: [
              {
                sublist: [{ text: 'foo' }, { text: 'foo', subcontrol: 'bar' }],
                control: 'bar',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Bar',
              },
            ],
          },
          {
            list: [
              {
                sublist: [{ text: 'foo' }, { text: 'foo', subcontrol: 'bar' }],
                control: 'bar',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Bar',
              },
            ],
          },
        ],
        list: [
          [
            {
              sublist: [{ text: 'foo' }, { text: 'foo', subcontrol: 'bar' }],
              control: 'bar',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Bar',
            },
          ],
          {
            list: [
              {
                sublist: [{ text: 'foo' }, { text: 'foo', subcontrol: 'bar' }],
                control: 'bar',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Bar',
              },
            ],
          },
        ],
        listContainer: [
          {
            sublist: [{ text: 'foo' }],
          },
          {
            list: [
              {
                sublist: [{ text: 'foo' }],
                control: 'bar',
              },
            ],
          },
        ],
        sublist: [
          [{ text: 'foo' }, { text: 'foo', subcontrol: 'bar' }],
          {
            list: [
              {
                sublist: [{ text: 'foo' }, { text: 'foo', subcontrol: 'bar' }],
                control: 'bar',
              },
            ],
          },
        ],
        sublistContainer: [
          { text: 'foo' },
          {
            list: [
              {
                sublist: [{ text: 'foo', subcontrol: 'foo' }],
                control: 'bar',
              },
            ],
          },
        ],
        text: [
          'foo',
          {
            list: [
              {
                sublist: [{ text: 'foo', subcontrol: 'foo' }],
                control: 'bar',
              },
            ],
          },
        ],
      },
      load: {
        form: [
          {
            list: [
              {
                sublist: [
                  { text: 'foo', subcontrol: 'bar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'baz',
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: 'BAZ',
              },
            ],
          },
          {
            list: [
              {
                sublist: [
                  { text: 'foo', subcontrol: 'bar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'baz',
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: 'BAZ',
              },
            ],
          },
        ],
        list: [
          [
            {
              sublist: [
                { text: 'foo', subcontrol: 'bar' },
                { text: 'Foo', subcontrol: 'Bar' },
              ],
              control: 'baz',
            },
            {
              sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
              control: 'BAZ',
            },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'foo', subcontrol: 'bar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'baz',
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: 'BAZ',
              },
            ],
          },
        ],
        listContainer: [
          {
            sublist: [
              { text: 'foo', subcontrol: 'bar' },
              { text: 'Foo', subcontrol: 'Bar' },
            ],
            control: 'baz',
          },
          {
            list: [
              {
                sublist: [
                  { text: 'foo', subcontrol: 'bar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'baz',
              },
            ],
          },
        ],
        sublist: [
          [
            { text: 'foo', subcontrol: 'bar' },
            { text: 'Foo', subcontrol: 'Bar' },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'foo', subcontrol: 'bar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'bar',
              },
            ],
          },
        ],
        sublistContainer: [
          { text: 'foo', subcontrol: 'bar' },
          {
            list: [
              {
                sublist: [{ text: 'foo', subcontrol: 'bar' }],
                control: 'bar',
              },
            ],
          },
        ],
        text: [
          'foo',
          {
            list: [
              {
                sublist: [{ text: 'foo', subcontrol: 'foo' }],
                control: 'bar',
              },
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
        listContainer: {
          list: [
            {
              sublist: [],
              control: null,
            },
          ],
        },
        sublist: {
          list: [
            {
              sublist: [],
              control: 'bar',
            },
          ],
        },
        sublistContainer: {
          list: [
            {
              sublist: [{ text: null, subcontrol: null }],
              control: 'bar',
            },
          ],
        },
        text: {
          list: [
            {
              sublist: [{ text: null, subcontrol: 'foo' }],
              control: 'bar',
            },
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
          {
            sublist: [
              { text: 'foo', subcontrol: 'bar' },
              { text: 'baz', subcontrol: 'foobar' },
            ],
            control: 'foo',
          },
          {
            sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
            control: 'Foo',
          },
        ],
      },
      initial: {
        list: [
          {
            sublist: [
              { text: 'foo', subcontrol: 'bar' },
              { text: 'baz', subcontrol: 'foobar' },
            ],
            control: 'foo',
          },
          {
            sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
            control: 'Foo',
          },
        ],
      },
      add: {
        list: {
          list: [
            {
              sublist: [
                { text: 'foo', subcontrol: 'bar' },
                { text: 'baz', subcontrol: 'foobar' },
              ],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
            {
              sublist: [{ text: null, subcontrol: 'foo' }],
              control: 'bar',
            },
          ],
        },
        sublist: {
          list: [
            {
              sublist: [
                { text: 'foo', subcontrol: 'bar' },
                { text: 'baz', subcontrol: 'foobar' },
                { text: null, subcontrol: 'foo' },
              ],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
      },
      update: {
        form: [
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
              },
            ],
          },
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
              },
            ],
          },
        ],
        formVModel: [
          {
            list: [
              {
                sublist: [
                  { text: 'FOO', subcontrol: 'baz' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
                control: 'baz',
              },
            ],
          },
          {
            list: [
              {
                sublist: [
                  { text: 'FOO', subcontrol: 'baz' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
                control: 'baz',
              },
            ],
          },
        ],
        list: [
          [
            {
              sublist: [{ text: 'FOO' }, { text: 'BAZ', subcontrol: 'FOOBAR' }],
            },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
              },
            ],
          },
        ],
        listContainer: [
          {
            sublist: [{ text: 'FOO' }, { text: 'BAZ', subcontrol: 'FOOBAR' }],
          },
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublist: [
          [{ text: 'FOO' }, { text: 'BAZ', subcontrol: 'FOOBAR' }],
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublistContainer: [
          { text: 'FOO' },
          {
            list: [
              {
                sublist: [
                  { text: 'FOO', subcontrol: 'bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        text: [
          'Foo',
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
      },
      load: {
        form: [
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'Bar',
              },
              {
                sublist: [],
                control: null,
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: null,
              },
            ],
          },
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'Bar',
              },
              {
                sublist: [],
                control: null,
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: null,
              },
            ],
          },
        ],
        list: [
          [
            {
              sublist: [
                { text: 'Foo', subcontrol: 'Bar' },
                { text: 'Baz', subcontrol: 'Foobar' },
                { text: 'Foo', subcontrol: 'Bar' },
              ],
              control: 'Bar',
            },
            {
              sublist: [],
              control: null,
            },
            {
              sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
              control: null,
            },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'Bar',
              },
              {
                sublist: [],
                control: null,
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: null,
              },
            ],
          },
        ],
        listContainer: [
          {
            sublist: [
              { text: 'Foo', subcontrol: 'Bar' },
              { text: 'Baz', subcontrol: 'Foobar' },
              { text: 'Foo', subcontrol: 'Bar' },
            ],
            control: 'Bar',
          },
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'Bar',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublist: [
          [
            { text: 'Foo', subcontrol: 'Bar' },
            { text: 'Baz', subcontrol: 'Foobar' },
            { text: 'Foo', subcontrol: 'Bar' },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublistContainer: [
          { text: 'Foo', subcontrol: 'Bar' },
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        text: [
          'Foo',
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
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
        listContainerEmpty: [
          undefined,
          {
            list: [
              {
                sublist: [],
                control: null,
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublistEmpty: [
          undefined,
          {
            list: [
              {
                sublist: [],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublistContainerEmpty: [
          undefined,
          {
            list: [
              {
                sublist: [
                  { text: null, subcontrol: null },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [
              {
                sublist: [
                  { text: null, subcontrol: 'bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
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
        listContainer: {
          list: [
            {
              sublist: [],
              control: null,
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
        sublist: {
          list: [
            {
              sublist: [],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
        sublistContainer: {
          list: [
            {
              sublist: [
                { text: null, subcontrol: null },
                { text: 'baz', subcontrol: 'foobar' },
              ],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
        text: {
          list: [
            {
              sublist: [
                { text: null, subcontrol: 'bar' },
                { text: 'baz', subcontrol: 'foobar' },
              ],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
      },
    },
  },
  {
    suite: 'LIST v-model',
    params: {
      listVModel: [
        {
          sublist: [
            { text: 'foo', subcontrol: 'bar' },
            { text: 'baz', subcontrol: 'foobar' },
          ],
          control: 'foo',
        },
        {
          sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
          control: 'Foo',
        },
      ],
      initial: {
        list: [
          {
            sublist: [
              { text: 'foo', subcontrol: 'bar' },
              { text: 'baz', subcontrol: 'foobar' },
            ],
            control: 'foo',
          },
          {
            sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
            control: 'Foo',
          },
        ],
      },
      add: {
        list: {
          list: [
            {
              sublist: [
                { text: 'foo', subcontrol: 'bar' },
                { text: 'baz', subcontrol: 'foobar' },
              ],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
            {
              sublist: [{ text: null, subcontrol: 'foo' }],
              control: 'bar',
            },
          ],
        },
        sublist: {
          list: [
            {
              sublist: [
                { text: 'foo', subcontrol: 'bar' },
                { text: 'baz', subcontrol: 'foobar' },
                { text: null, subcontrol: 'foo' },
              ],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
      },
      update: {
        form: [
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
              },
            ],
          },
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
              },
            ],
          },
        ],
        listVModel: [
          [
            {
              sublist: [
                { text: 'FOO', subcontrol: 'baz' },
                { text: 'BAZ', subcontrol: 'FOOBAR' },
              ],
              control: 'baz',
            },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'FOO', subcontrol: 'baz' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
                control: 'baz',
              },
            ],
          },
        ],
        list: [
          [
            {
              sublist: [{ text: 'FOO' }, { text: 'BAZ', subcontrol: 'FOOBAR' }],
            },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
              },
            ],
          },
        ],
        listContainer: [
          {
            sublist: [{ text: 'FOO' }, { text: 'BAZ', subcontrol: 'FOOBAR' }],
          },
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublist: [
          [{ text: 'FOO' }, { text: 'BAZ', subcontrol: 'FOOBAR' }],
          {
            list: [
              {
                sublist: [
                  { text: 'FOO' },
                  { text: 'BAZ', subcontrol: 'FOOBAR' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublistContainer: [
          { text: 'FOO' },
          {
            list: [
              {
                sublist: [
                  { text: 'FOO', subcontrol: 'bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        text: [
          'Foo',
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
      },
      load: {
        form: [
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'Bar',
              },
              {
                sublist: [],
                control: null,
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: null,
              },
            ],
          },
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'Bar',
              },
              {
                sublist: [],
                control: null,
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: null,
              },
            ],
          },
        ],
        list: [
          [
            {
              sublist: [
                { text: 'Foo', subcontrol: 'Bar' },
                { text: 'Baz', subcontrol: 'Foobar' },
                { text: 'Foo', subcontrol: 'Bar' },
              ],
              control: 'Bar',
            },
            {
              sublist: [],
              control: null,
            },
            {
              sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
              control: null,
            },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'Bar',
              },
              {
                sublist: [],
                control: null,
              },
              {
                sublist: [{ text: 'FOO', subcontrol: 'BAR' }],
                control: null,
              },
            ],
          },
        ],
        listContainer: [
          {
            sublist: [
              { text: 'Foo', subcontrol: 'Bar' },
              { text: 'Baz', subcontrol: 'Foobar' },
              { text: 'Foo', subcontrol: 'Bar' },
            ],
            control: 'Bar',
          },
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'Bar',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublist: [
          [
            { text: 'Foo', subcontrol: 'Bar' },
            { text: 'Baz', subcontrol: 'Foobar' },
            { text: 'Foo', subcontrol: 'Bar' },
          ],
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'Baz', subcontrol: 'Foobar' },
                  { text: 'Foo', subcontrol: 'Bar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublistContainer: [
          { text: 'Foo', subcontrol: 'Bar' },
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'Bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        text: [
          'Foo',
          {
            list: [
              {
                sublist: [
                  { text: 'Foo', subcontrol: 'bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
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
        listContainerEmpty: [
          undefined,
          {
            list: [
              {
                sublist: [],
                control: null,
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublistEmpty: [
          undefined,
          {
            list: [
              {
                sublist: [],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        sublistContainerEmpty: [
          undefined,
          {
            list: [
              {
                sublist: [
                  { text: null, subcontrol: null },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
            ],
          },
        ],
        textEmpty: [
          undefined,
          {
            list: [
              {
                sublist: [
                  { text: null, subcontrol: 'bar' },
                  { text: 'baz', subcontrol: 'foobar' },
                ],
                control: 'foo',
              },
              {
                sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
                control: 'Foo',
              },
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
        listContainer: {
          list: [
            {
              sublist: [],
              control: null,
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
        sublist: {
          list: [
            {
              sublist: [],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
        sublistContainer: {
          list: [
            {
              sublist: [
                { text: null, subcontrol: null },
                { text: 'baz', subcontrol: 'foobar' },
              ],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
        text: {
          list: [
            {
              sublist: [
                { text: null, subcontrol: 'bar' },
                { text: 'baz', subcontrol: 'foobar' },
              ],
              control: 'foo',
            },
            {
              sublist: [{ text: 'Foo', subcontrol: 'Bar' }],
              control: 'Foo',
            },
          ],
        },
      },
    },
  },
]

runner('<VfForm> / <VfList> / <VfList> / <VfText>', cases, template, createCase)
