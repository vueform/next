```ts
/**
 * The attribute bag the `inputAria` pattern resolves for the `input` part:
 * describedby to the rendered help/description/error regions, plus invalid,
 * required, and busy state. Components whose `input` entry merges their own
 * attributes on top compose it (`() => { ... } & InputAriaBag`).
 */
interface InputAriaBag {
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-required'?: true
  'aria-busy'?: true
}
```
