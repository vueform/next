```ts
/**
 * Props for the VfSteps component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfStepsProps extends StepsProps<
  VfStepsSlots,
  VfStepsParts,
  VfStepsClasses,
  VfStepsContext
> {}
```
