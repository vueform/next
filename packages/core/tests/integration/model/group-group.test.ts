import { vModelAndChange } from '../../helpers'
import createCase from './create.groups'
import runner from './runner'

const template = `
  <VfForm ${vModelAndChange('form')}>
    <VfGroup name="container">
      <VfGroup name="subcontainer">
        <VfText name="text" ${vModelAndChange('text')} />
        <VfText name="subcontainer_control" model-value="foo" />
      </VfGroup>
      <VfGroup name="subcontainer_sibling">
        <VfText name="subcontainer_sibling_control" model-value="bar" />
      </VfGroup>
    </VfGroup>
    <VfGroup name="sibling">
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
        text: null,
        subcontainer_control: 'foo',
        subcontainer_sibling_control: 'bar',
        sibling_control: 'baz',
        control: 'foobar',
      },
      update: {
        form: [
          { text: 'foo' },
          {
            text: 'foo',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        container: [
          // VfGroup update likely acts as scoped update for its children
          {
            text: 'foo',
            subcontainer_control: 'Foo',
            subcontainer_sibling_control: 'Bar',
          }, // Assuming update on group requires all its children
          {
            text: 'foo',
            subcontainer_control: 'Foo',
            subcontainer_sibling_control: 'Bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          // VfGroup update likely acts as scoped update for its children
          { text: 'foo', subcontainer_control: 'Foo' }, // Assuming update on group requires all its children
          {
            text: 'foo',
            subcontainer_control: 'Foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'foo',
          {
            text: 'foo',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      load: {
        form: [
          {
            text: 'foo',
            subcontainer_control: 'Foo',
            subcontainer_sibling_control: 'Bar',
            sibling_control: 'Baz',
            control: 'Foobar',
          },
          {
            text: 'foo',
            subcontainer_control: 'Foo',
            subcontainer_sibling_control: 'Bar',
            sibling_control: 'Baz',
            control: 'Foobar',
          },
        ],
        container: [
          // Load into group affects its children
          {
            text: 'foo',
            subcontainer_control: 'Foo',
            subcontainer_sibling_control: 'Bar',
          },
          {
            text: 'foo',
            subcontainer_control: 'Foo',
            subcontainer_sibling_control: 'Bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          // Load into group affects its children
          {
            text: 'foo',
            subcontainer_control: 'Foo',
          },
          {
            text: 'foo',
            subcontainer_control: 'Foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'foo',
          {
            text: 'foo',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
            sibling_control: null,
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: null,
          sibling_control: null,
          control: null,
        },
        container: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: null,
          sibling_control: 'baz',
          control: 'foobar',
        },
        subcontainer: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: 'bar',
          sibling_control: 'baz',
          control: 'foobar',
        },
        text: {
          text: null,
          subcontainer_control: 'foo',
          subcontainer_sibling_control: 'bar',
          sibling_control: 'baz',
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: { text: 'baz' },
      initial: {
        text: 'baz',
        subcontainer_control: 'foo',
        subcontainer_sibling_control: 'bar',
        sibling_control: 'baz',
        control: 'foobar',
      },
      update: {
        form: [
          { text: 'qux' },
          {
            text: 'qux',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        container: [
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
          },
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            text: 'qux',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formVModel: [
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
            sibling_control: 'Corge',
            control: 'Grault',
          },
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
            sibling_control: 'Corge',
            control: 'Grault',
          },
        ],
      },
      load: {
        form: [
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
            sibling_control: 'Garply',
            control: 'Waldo',
          },
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
            sibling_control: 'Garply',
            control: 'Waldo',
          },
        ],
        container: [
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
          },
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          {
            text: 'corge',
            subcontainer_control: 'Corge',
          },
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'corge',
          {
            text: 'corge',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
            sibling_control: null,
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: null,
          sibling_control: null,
          control: null,
        },
        container: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: null,
          sibling_control: 'baz',
          control: 'foobar',
        },
        subcontainer: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: 'bar',
          sibling_control: 'baz',
          control: 'foobar',
        },
        text: {
          text: null,
          subcontainer_control: 'foo',
          subcontainer_sibling_control: 'bar',
          sibling_control: 'baz',
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
        text: 'baz', // from textVModel
        subcontainer_control: 'foo', // from element modelValue
        subcontainer_sibling_control: 'bar', // from element modelValue
        sibling_control: 'baz', // from element modelValue
        control: 'foobar', // from element modelValue
      },
      update: {
        form: [
          { text: 'qux' },
          {
            text: 'qux',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        container: [
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
          },
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            text: 'qux',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textVModel: [
          // Updates the specific field controlled by the v-model
          'qux',
          {
            text: 'qux',
            subcontainer_control: 'foo', // Not affected by textVModel
            subcontainer_sibling_control: 'bar', // Not affected by textVModel
            sibling_control: 'baz', // Not affected by textVModel
            control: 'foobar', // Not affected by textVModel
          },
        ],
      },
      load: {
        form: [
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
            sibling_control: 'Garply',
            control: 'Waldo',
          },
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
            sibling_control: 'Garply',
            control: 'Waldo',
          },
        ],
        container: [
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
          },
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          {
            text: 'corge',
            subcontainer_control: 'Corge',
          },
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'corge',
          {
            text: 'corge',
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
            sibling_control: null,
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            text: null,
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: null,
          sibling_control: null,
          control: null,
        },
        container: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: null,
          sibling_control: 'baz',
          control: 'foobar',
        },
        subcontainer: {
          text: null,
          subcontainer_control: null,
          subcontainer_sibling_control: 'bar',
          sibling_control: 'baz',
          control: 'foobar',
        },
        text: {
          text: null,
          subcontainer_control: 'foo',
          subcontainer_sibling_control: 'bar',
          sibling_control: 'baz',
          control: 'foobar',
        },
      },
    },
  },
]

runner(
  '<VfForm> / <VfGroup> / <VfGroup> / <VfText>',
  cases,
  template,
  createCase
)
