```ts
/**
 * Defines how an element appears as a page in stepped/tabbed forms.
 *
 * - `string` — plain label text.
 * - `Record<string, string>` — locale map resolved by the current language.
 * - `Ref<string | Record<string, string>>` — reactive label.
 * - `[PageMeta]` — tuple; `label` becomes the tab/step label, remaining keys are
 *   exposed as page metadata.
 * - `(context$) => string | Record<string, string> | [PageMeta]` — contextual
 *   function returning either a plain label or a metadata tuple.
 */
type PageProp<TContext = any> =
  | string
  | Record<string, string>
  | Ref<string | Record<string, string>>
  | [PageMeta<TContext>]
  | ((
      context$: TContext
    ) => string | Record<string, string> | [PageMeta<TContext>])
```
