import { vModelAndChange } from '../../helpers'
import createCase from './create.groups'
import runner from './runner'

const template = `
  <VfForm ${vModelAndChange('form')}>
    <VfGroup nested name="container" ${vModelAndChange('container')}>
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
        container: {
          text: null,
          subcontainer_control: 'foo',
          subcontainer_sibling_control: 'bar',
        },
        sibling_control: 'baz',
        control: 'foobar',
      },
      update: {
        form: [
          { container: { text: 'qux' } },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        container: [
          // Update Object: needs full object content
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
          },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'Quux',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          // Update Group: affects its children within the parent object
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            container: {
              text: 'qux',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'Garply',
            control: 'Waldo',
          },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'Garply',
            control: 'Waldo',
          },
        ],
        container: [
          // Load Object: needs full object content
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
          },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          // Load Group: affects its children within the parent object
          {
            text: 'corge',
            subcontainer_control: 'Corge',
          },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'corge',
          {
            container: {
              text: 'corge',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: null,
            },
            sibling_control: null,
            control: null,
          },
        ],
        containerEmpty: [
          // Clear Object: clears its children
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: null,
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          // Clear Group: clears its children within parent
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
          },
          sibling_control: null,
          control: null,
        },
        container: {
          // Clear Object: clears its children
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
        subcontainer: {
          // Clear Group: clears its children within parent
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: 'bar',
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
        text: {
          container: {
            text: null,
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'FORM v-model',
    params: {
      formVModel: { container: { text: 'baz' } },
      initial: {
        container: {
          text: 'baz', // from formVModel
          subcontainer_control: 'foo',
          subcontainer_sibling_control: 'bar',
        },
        sibling_control: 'baz',
        control: 'foobar',
      },
      update: {
        form: [
          { container: { text: 'qux' } },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
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
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'Quux',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            container: {
              text: 'qux',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formVModel: [
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'Quux',
            },
            sibling_control: 'Corge',
            control: 'Grault',
          },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'Quux',
            },
            sibling_control: 'Corge',
            control: 'Grault',
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'Garply',
            control: 'Waldo',
          },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
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
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
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
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'corge',
          {
            container: {
              text: 'corge',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: null,
            },
            sibling_control: null,
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: null,
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
          },
          sibling_control: null,
          control: null,
        },
        container: {
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
        subcontainer: {
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: 'bar',
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
        text: {
          container: {
            text: null,
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
      },
    },
  },
  {
    suite: 'CONTAINER v-model', // VfGroup nested v-model
    params: {
      containerVModel: { text: 'baz' }, // Affects children within the object
      initial: {
        container: {
          text: 'baz', // from containerVModel
          subcontainer_control: 'foo',
          subcontainer_sibling_control: 'bar',
        },
        sibling_control: 'baz',
        control: 'foobar',
      },
      update: {
        form: [
          { container: { text: 'qux' } },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        container: [
          // Update Object
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
          },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'Quux',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          // Update Group
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            container: {
              text: 'qux',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        containerVModel: [
          // Update v-model on Object: must provide structure for its children
          {
            text: 'qux',
            subcontainer_control: 'Qux',
            subcontainer_sibling_control: 'Quux',
          },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'Quux',
            },
            sibling_control: 'baz', // Not affected
            control: 'foobar', // Not affected
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'Garply',
            control: 'Waldo',
          },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'Garply',
            control: 'Waldo',
          },
        ],
        container: [
          // Load Object
          {
            text: 'corge',
            subcontainer_control: 'Corge',
            subcontainer_sibling_control: 'Grault',
          },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          // Load Group
          {
            text: 'corge',
            subcontainer_control: 'Corge',
          },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'corge',
          {
            container: {
              text: 'corge',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: null,
            },
            sibling_control: null,
            control: null,
          },
        ],
        containerEmpty: [
          // Clear Object
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: null,
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          // Clear Group
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
          },
          sibling_control: null,
          control: null,
        },
        container: {
          // Clear Object: clears its children
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
        subcontainer: {
          // Clear Group: clears its children within parent
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: 'bar',
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
        text: {
          container: {
            text: null,
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
          },
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
        container: {
          text: 'baz', // from textVModel
          subcontainer_control: 'foo',
          subcontainer_sibling_control: 'bar',
        },
        sibling_control: 'baz',
        control: 'foobar',
      },
      update: {
        form: [
          { container: { text: 'qux' } },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
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
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'Quux',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'qux', subcontainer_control: 'Qux' },
          {
            container: {
              text: 'qux',
              subcontainer_control: 'Qux',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          'qux',
          {
            container: {
              text: 'qux',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textVModel: [
          // Update v-model on Text element
          'qux',
          {
            container: {
              // Expected form data reflects the update
              text: 'qux',
              subcontainer_control: 'foo', // Not affected
              subcontainer_sibling_control: 'bar', // Not affected
            },
            sibling_control: 'baz', // Not affected
            control: 'foobar', // Not affected
          },
        ],
      },
      load: {
        form: [
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'Garply',
            control: 'Waldo',
          },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
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
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'Grault',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainer: [
          { text: 'corge', subcontainer_control: 'Corge' },
          {
            container: {
              text: 'corge',
              subcontainer_control: 'Corge',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        text: [
          // Load text element
          'corge',
          {
            container: {
              text: 'corge',
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        formEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: null,
            },
            sibling_control: null,
            control: null,
          },
        ],
        containerEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: null,
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        subcontainerEmpty: [
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: null,
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
        textEmpty: [
          // Clear text element
          undefined,
          {
            container: {
              text: null,
              subcontainer_control: 'foo',
              subcontainer_sibling_control: 'bar',
            },
            sibling_control: 'baz',
            control: 'foobar',
          },
        ],
      },
      clear: {
        form: {
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
          },
          sibling_control: null,
          control: null,
        },
        container: {
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: null,
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
        subcontainer: {
          container: {
            text: null,
            subcontainer_control: null,
            subcontainer_sibling_control: 'bar',
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
        text: {
          // Clear text: sets only text to null within container
          container: {
            text: null,
            subcontainer_control: 'foo',
            subcontainer_sibling_control: 'bar',
          },
          sibling_control: 'baz',
          control: 'foobar',
        },
      },
    },
  },
]

runner(
  '<VfForm> / <VfGroup nested> / <VfGroup> / <VfText>',
  cases,
  template,
  createCase
)
