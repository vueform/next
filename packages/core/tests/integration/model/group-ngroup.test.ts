import { vModelAndChange } from '../../helpers'
import createCase from './create.groups'
import runner from './runner'

const template = `
  <VfForm ${vModelAndChange('form')}>
    <VfGroup name="container">
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
        subcontainer: { text: null, subcontainer_control: 'foo' },
        subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
        sibling: { sibling_control: 'baz' },
        control: 'foobar',
      },
      update: {
        form: [
          { subcontainer: { text: 'foo' } },
          {
            subcontainer: { text: 'foo', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        container: [
          // Update Group: affects children subcontainer & subcontainer_sibling
          {
            subcontainer: { text: 'foo', subcontainer_control: 'Foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Bar' },
          },
          {
            subcontainer: { text: 'foo', subcontainer_control: 'Foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          // Update Object
          { text: 'foo', subcontainer_control: 'Foo' },
          {
            subcontainer: { text: 'foo', subcontainer_control: 'Foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'foo',
          {
            subcontainer: { text: 'foo', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        input: [
          'foo',
          {
            subcontainer: { text: 'foo', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      load: {
        form: [
          {
            subcontainer: { text: 'foo', subcontainer_control: 'Foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Bar' },
            sibling: { sibling_control: 'Baz' },
            control: 'Foobar',
          },
          {
            subcontainer: { text: 'foo', subcontainer_control: 'Foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Bar' },
            sibling: { sibling_control: 'Baz' },
            control: 'Foobar',
          },
        ],
        container: [
          // Load Group: affects children subcontainer & subcontainer_sibling
          {
            subcontainer: { text: 'foo', subcontainer_control: 'Foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Bar' },
          },
          {
            subcontainer: { text: 'foo', subcontainer_control: 'Foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          // Load Object
          {
            text: 'foo',
            subcontainer_control: 'Foo',
          },
          {
            subcontainer: { text: 'foo', subcontainer_control: 'Foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'foo',
          {
            subcontainer: { text: 'foo', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
            sibling: { sibling_control: null },
            control: null,
          },
        ],
        containerEmpty: [
          // Clear Group: affects children subcontainer & subcontainer_sibling
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          // Clear Object
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: null },
          sibling: { sibling_control: null },
          control: null,
        },
        container: {
          // Clear Group: affects children subcontainer & subcontainer_sibling
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: null },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        subcontainer: {
          // Clear Object
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        text: {
          subcontainer: { text: null, subcontainer_control: 'foo' },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: { subcontainer: { text: 'baz' } },
      initial: {
        subcontainer: { text: 'baz', subcontainer_control: 'foo' },
        subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
        sibling: { sibling_control: 'baz' },
        control: 'foobar',
      },
      update: {
        form: [
          { subcontainer: { text: 'qux' } },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        container: [
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
          },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        input: [
          'qux',
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formVModel: [
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
            sibling: { sibling_control: 'Corge' },
            control: 'Grault',
          },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
            sibling: { sibling_control: 'Corge' },
            control: 'Grault',
          },
        ],
      },
      load: {
        form: [
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
        ],
        container: [
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
          },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'corge', subcontainer_control: 'Corge' },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'corge',
          {
            subcontainer: { text: 'corge', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
            sibling: { sibling_control: null },
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: null },
          sibling: { sibling_control: null },
          control: null,
        },
        container: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: null },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        subcontainer: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        text: {
          subcontainer: { text: null, subcontainer_control: 'foo' },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'SUBCONTAINER v-model', // VfGroup nested v-model
    params: {
      subcontainerVModel: { text: 'baz' }, // Affects children 'text' and 'subcontainer_control'
      initial: {
        subcontainer: { text: 'baz', subcontainer_control: 'foo' }, // text from v-model, control from element modelValue (overridden by v-model if key present?) Assuming higher takes precedence. Let's say v-model only provides 'text'.
        // If subcontainerVModel was { text: 'baz', subcontainer_control: 'Baz' } then initial control would be 'Baz'.
        // Let's assume subcontainerVModel only sets 'text'.
        subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
        sibling: { sibling_control: 'baz' },
        control: 'foobar',
      },
      update: {
        form: [
          { subcontainer: { text: 'qux' } },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        container: [
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
          },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerVModel: [
          // Update v-model on Object: must provide structure for its children
          { text: 'qux', subcontainer_control: 'Qux' }, // Providing both children
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' }, // Not affected
            sibling: { sibling_control: 'baz' }, // Not affected
            control: 'foobar', // Not affected
          },
        ],
      },
      load: {
        form: [
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
        ],
        container: [
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
          },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          // Load Object
          { text: 'corge', subcontainer_control: 'Corge' },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'corge',
          {
            subcontainer: { text: 'corge', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
            sibling: { sibling_control: null },
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          // Clear Object
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: null },
          sibling: { sibling_control: null },
          control: null,
        },
        container: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: null },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        subcontainer: {
          // Clear Object: clears its children
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        text: {
          subcontainer: { text: null, subcontainer_control: 'foo' },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
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
        subcontainer: { text: 'baz', subcontainer_control: 'foo' }, // text from v-model
        subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
        sibling: { sibling_control: 'baz' },
        control: 'foobar',
      },
      update: {
        form: [
          { subcontainer: { text: 'qux' } },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        container: [
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
          },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Quux' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            subcontainer: { text: 'qux', subcontainer_control: 'Qux' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        input: [
          'qux',
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textVModel: [
          // Update v-model on Text element
          'qux',
          {
            subcontainer: { text: 'qux', subcontainer_control: 'foo' }, // Only text changes
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      load: {
        form: [
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'Garply' },
            control: 'Waldo',
          },
        ],
        container: [
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
          },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'Grault' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'corge', subcontainer_control: 'Corge' },
          {
            subcontainer: { text: 'corge', subcontainer_control: 'Corge' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        text: [
          // Load text element
          'corge',
          {
            subcontainer: { text: 'corge', subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
            sibling: { sibling_control: null },
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: null },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: null },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
        textEmpty: [
          // Clear text element
          undefined,
          {
            subcontainer: { text: null, subcontainer_control: 'foo' },
            subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
            sibling: { sibling_control: 'baz' },
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: null },
          sibling: { sibling_control: null },
          control: null,
        },
        container: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: null },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        subcontainer: {
          subcontainer: { text: null, subcontainer_control: null },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
        text: {
          // Clear text: sets only text to null
          subcontainer: { text: null, subcontainer_control: 'foo' },
          subcontainer_sibling: { subcontainer_sibling_control: 'bar' },
          sibling: { sibling_control: 'baz' },
          control: 'foobar',
        },
      },
    },
  },
]

runner(
  '<VfForm> / <VfGroup> / <VfGroup nested> / <VfText>',
  cases,
  template,
  createCase
)
