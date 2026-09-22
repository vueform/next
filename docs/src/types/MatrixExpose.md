```ts
/**
 * Schema definition for a matrix cell element, requiring a type property.
 */
// type MatrixElementSchema = MakeRequired<
//   Extract<
//     ControlRegistry[keyof ControlRegistry]['schema'],
//     { type?: MatrixInput }
//   >,
//   'type'
// >

/**
 * Augmentable public API surface for matrix-based components.
 */
export interface MatrixExpose extends BaseElementExpose, MatrixApi {}
```
