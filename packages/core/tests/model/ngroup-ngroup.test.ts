import { vModelAndChange } from '../helpers'
import createCase from './create.groups'
import runner from './runner'

const template = `
  <VfForm ${vModelAndChange('form')}>
    <VfGroup nested name="container" ${vModelAndChange('container')}>
      <VfGroup nested name="subcontainer" ${vModelAndChange('subcontainer')}>
        <VfText name="text" ${vModelAndChange('text')} />
        <VfText name="subcontainer_control" model-value="foo" />
      </VfGroup>
      <VfGroup nested name="subcontainer_sibling">
        <VfText name="subcontainer_sibling_control" model-value="bar" />
      </VfGroup>
    </VfGroup>
    <VfGroup nested name="sibling">
      <VfText name="sibling_control" model-value="baz" />
    </VfGroup>
    <VfText name="control" model-value="foobar" />
  </VfForm>
`

const cases = [
  {
    suite: 'NO v-model',
    params: {
      initial: {
        container: {
          subcontainer: {
            text: null,
            subcontainer_control: 'foo',
          },
          subcontainer_sibling: {
            subcontainer_sibling_control: 'bar',
          },
        },
        sibling: {
          sibling_control: 'baz',
        },
        control: 'foobar',
      },
      update: {
        form: [
          { container: { subcontainer: { text: 'foo' } } },
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
        container: [
          { subcontainer: { text: 'foo' } },
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'foo' },
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
        text: [
          'foo',
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'Foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'Bar',
              },
            },
            sibling: {
              sibling_control: 'Baz',
            },
            control: 'Foobar',
          },
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'Foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'Bar',
              },
            },
            sibling: {
              sibling_control: 'Baz',
            },
            control: 'Foobar',
          },
        ],
        container: [
          {
            subcontainer: {
              text: 'foo',
              subcontainer_control: 'Foo',
            },
            subcontainer_sibling: {
              subcontainer_sibling_control: 'Bar',
            },
          },
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'Foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'Bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
        subcontainer: [
          {
            text: 'foo',
            subcontainer_control: 'Foo',
          },
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'Foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
        text: [
          'foo',
          {
            container: {
              subcontainer: {
                text: 'foo',
                subcontainer_control: 'foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              subcontainer: {
                text: null,
                subcontainer_control: null,
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: null,
              },
            },
            sibling: {
              sibling_control: null,
            },
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              subcontainer: {
                text: null,
                subcontainer_control: null,
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: null,
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            container: {
              subcontainer: {
                text: null,
                subcontainer_control: null,
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              subcontainer: {
                text: null,
                subcontainer_control: 'foo',
              },
              subcontainer_sibling: {
                subcontainer_sibling_control: 'bar',
              },
            },
            sibling: {
              sibling_control: 'baz',
            },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            subcontainer: {
              text: null,
              subcontainer_control: null,
            },
            subcontainer_sibling: {
              subcontainer_sibling_control: null,
            },
          },
          sibling: {
            sibling_control: null,
          },
          control: null,
        },
        container: {
          container: {
            subcontainer: {
              text: null,
              subcontainer_control: null,
            },
            subcontainer_sibling: {
              subcontainer_sibling_control: null,
            },
          },
          sibling: {
            sibling_control: 'baz',
          },
          control: 'foobar',
        },
        subcontainer: {
          container: {
            subcontainer: {
              text: null,
              subcontainer_control: null,
            },
            subcontainer_sibling: {
              subcontainer_sibling_control: 'bar',
            },
          },
          sibling: {
            sibling_control: 'baz',
          },
          control: 'foobar',
        },
        text: {
          container: {
            subcontainer: {
              text: null,
              subcontainer_control: 'foo',
            },
            subcontainer_sibling: {
              subcontainer_sibling_control: 'bar',
            },
          },
          sibling: {
            sibling_control: 'baz',
          },
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: { container: { subcontainer: { text: 'baz' } } },
      initial: {
        container: {
          subcontainer: { text: 'baz', subcontainer_control: 'foo' },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
        },
        sibling: { sibling_control: 'baz' },
        control: 'foobar',
      },
      update: {
        form: [
          { container: { subcontainer: { text: 'foobar' } } },
          {
            container: {
              subcontainer: { text: 'foobar', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        container: [
          { subcontainer: { text: 'foobar' } },
          {
            container: {
              subcontainer: { text: 'foobar', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'foobar' },
          {
            container: {
              subcontainer: { text: 'foobar', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'foobar',
          {
            container: {
              subcontainer: { text: 'foobar', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formVModel: [
          {
            container: {
              subcontainer: { text: 'foobar', subcontainer_control: 'Bar' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Baz' },
            },
            sibling: { sibling_control: 'Qux' },
            control: 'Quux',
          },
          {
            container: {
              subcontainer: { text: 'foobar', subcontainer_control: 'Bar' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Baz' },
            },
            sibling: { sibling_control: 'Qux' },
            control: 'Quux',
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              subcontainer: { text: 'foobar', subcontainer_control: 'Bar' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Baz' },
            },
            sibling: { sibling_control: 'Qux' },
            control: 'Quux',
          },
          {
            container: {
              subcontainer: { text: 'foobar', subcontainer_control: 'Bar' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Baz' },
            },
            sibling: { sibling_control: 'Qux' },
            control: 'Quux',
          },
        ],
        container: [
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
          },
          {
            container: {
              subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'garply', subcontainer_control: 'Garply' },
          {
            container: {
              subcontainer: { text: 'garply', subcontainer_control: 'Garply' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'waldo',
          {
            container: {
              subcontainer: { text: 'waldo', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: null },
            },
            sibling: { sibling_control: null },
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: null },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
          },
          sibling: { sibling_control: null },
          control: null,
        },
        container: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        subcontainer: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        text: {
          container: {
            subcontainer: { text: null, subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'CONTAINER v-model',
    params: {
      containerVModel: { subcontainer: { text: 'baz' } },
      initial: {
        container: {
          subcontainer: { text: 'baz', subcontainer_control: 'foo' },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
        },
        sibling: { sibling_control: 'baz' },
        control: 'foobar',
      },
      update: {
        form: [
          { container: { subcontainer: { text: 'qux' } } },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        container: [
          { subcontainer: { text: 'qux' } },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux' },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        containerVModel: [
          {
            subcontainer: { text: 'quux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
          },
          {
            container: {
              subcontainer: { text: 'quux', subcontainer_control: 'Qux' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
          {
            container: {
              subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
        ],
        container: [
          {
            subcontainer: { text: 'fred', subcontainer_control: 'Fred' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Plugh' },
          },
          {
            container: {
              subcontainer: { text: 'fred', subcontainer_control: 'Fred' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Plugh' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'xyzzy', subcontainer_control: 'Xyzzy' },
          {
            container: {
              subcontainer: { text: 'xyzzy', subcontainer_control: 'Xyzzy' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'thud',
          {
            container: {
              subcontainer: { text: 'thud', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: null },
            },
            sibling: { sibling_control: null },
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: null },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
          },
          sibling: { sibling_control: null },
          control: null,
        },
        container: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        subcontainer: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        text: {
          container: {
            subcontainer: { text: null, subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'SUBCONTAINER v-model',
    params: {
      subcontainerVModel: { text: 'baz' },
      initial: {
        container: {
          subcontainer: { text: 'baz', subcontainer_control: 'foo' },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
        },
        sibling: { sibling_control: 'baz' },
        control: 'foobar',
      },
      update: {
        form: [
          { container: { subcontainer: { text: 'qux' } } },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        container: [
          { subcontainer: { text: 'qux' } },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux' },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerVModel: [
          { text: 'quux', subcontainer_control: 'Qux' },
          {
            container: {
              subcontainer: { text: 'quux', subcontainer_control: 'Qux' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
          {
            container: {
              subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
        ],
        container: [
          {
            subcontainer: { text: 'fred', subcontainer_control: 'Fred' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Plugh' },
          },
          {
            container: {
              subcontainer: { text: 'fred', subcontainer_control: 'Fred' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Plugh' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'xyzzy', subcontainer_control: 'Xyzzy' },
          {
            container: {
              subcontainer: { text: 'xyzzy', subcontainer_control: 'Xyzzy' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'thud',
          {
            container: {
              subcontainer: { text: 'thud', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: null },
            },
            sibling: { sibling_control: null },
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: null },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
          },
          sibling: { sibling_control: null },
          control: null,
        },
        container: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        subcontainer: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        text: {
          container: {
            subcontainer: { text: null, subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'TEXT v-model',
    params: {
      textVModel: 'baz',
      initial: {
        container: {
          subcontainer: { text: 'baz', subcontainer_control: 'foo' },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
        },
        sibling: { sibling_control: 'baz' },
        control: 'foobar',
      },
      update: {
        form: [
          { container: { subcontainer: { text: 'qux' } } },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        container: [
          { subcontainer: { text: 'qux' } },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux' },
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            container: {
              subcontainer: { text: 'qux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textVModel: [
          'quux',
          {
            container: {
              subcontainer: { text: 'quux', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
          {
            container: {
              subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
        ],
        container: [
          {
            subcontainer: { text: 'fred', subcontainer_control: 'Fred' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Plugh' },
          },
          {
            container: {
              subcontainer: { text: 'fred', subcontainer_control: 'Fred' },
              subcontainer_sibling: { subcontainer_sibling_control: 'Plugh' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'xyzzy', subcontainer_control: 'Xyzzy' },
          {
            container: {
              subcontainer: { text: 'xyzzy', subcontainer_control: 'Xyzzy' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'thud',
          {
            container: {
              subcontainer: { text: 'thud', subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: null },
            },
            sibling: { sibling_control: null },
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: null },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: null },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              subcontainer: { text: null, subcontainer_control: 'foo' },
              subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
          },
          sibling: { sibling_control: null },
          control: null,
        },
        container: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        subcontainer: {
          container: {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        text: {
          container: {
            subcontainer: { text: null, subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
      },
    },
  },
]

runner(
  '<VfForm> / <VfGroup nested> / <VfGroup nested> / <VfText>',
  cases,
  template,
  createCase
)
