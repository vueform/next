```ts
/**
 * Part-keyed binding entries produced by the `tInputAria` pattern for
 * translatable text inputs: the `input` entry additionally references the
 * editing-language live region and carries the input's `lang`.
 */
/**
 * The attribute bag the `tInputAria` pattern resolves for the `input` part:
 * the `inputAria` state plus the active editing language.
 */
interface TInputAriaBag extends InputAriaBag {
  lang?: string
}
```
