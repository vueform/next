```ts
/**
 * Props for the VfContent component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 */
interface VfContentProps extends ContentProps<
  'content',
  VfContentSlots,
  VfContentParts,
  VfContentClasses,
  VfContentContext
> {}
```
