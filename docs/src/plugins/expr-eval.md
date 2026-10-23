# ExprEval

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | [Expression](/plugins/#expression) |
| **Dependencies** | <!-- @plugin:deps -->[`expr-eval-fork`](https://www.npmjs.com/package/expr-eval-fork)<!-- /@plugin:deps --> |
| **Bundle size** | <!-- @size:plugin -->2.84 kB *(10.50 kB with 3rd party deps)*<!-- /@size --> |

</div>

Expression evaluator used by Vueform for conditions and computed values.

## Installation

::: code-group

```bash [npm]
npm install @vueform/expr-eval
```

```bash [pnpm]
pnpm add @vueform/expr-eval
```

```bash [yarn]
yarn add @vueform/expr-eval
```

```bash [bun]
bun add @vueform/expr-eval
```

:::

```ts
import { createVueform } from '@vueform/ui'
import exprEval from '@vueform/expr-eval'

createVueform({
  plugins: [exprEval()], // [!code highlight]
})
```

## Usage

Registering the plugin replaces the default expression engine with a full evaluator. Bare path interpolation like `{name}` works without any plugin — everything beyond it, operators, comparisons, ternaries, and function calls, needs this engine:

```ts
import { defineSchema } from '@vueform/ui'

const schema = defineSchema({
  price: { type: 'text', label: 'Price', default: 100 },
  quantity: { type: 'text', label: 'Quantity', default: 3 },
  total: {
    type: 'text',
    label: 'Total',
    default: '{price * quantity}', // [!code highlight]
  },
})
```

The expression language and everything built on it — syntax and operators, built-in and custom functions, computed values, wildcards in lists, conditions, constants, escaping — is documented in the [expressions](/guide/expressions) guide, and the `$expression` options in the [configuration](/guide/configuration#expression) chapter.


## Source

[packages/expr-eval](https://github.com/vueform/next/tree/main/packages/expr-eval)
