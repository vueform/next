```ts
function defineFunction(
  func: (
    ctx: ExpressionFunctionContext
  ) => (...args: any[]) => string | number | boolean
): (
  ctx: ExpressionFunctionContext
) => (...args: any[]) => string | number | boolean
```
