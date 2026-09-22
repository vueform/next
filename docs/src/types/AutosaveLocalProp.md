```ts
/**
 * Configuration of the local half of autosave. `true` enables it with the
 * defaults (`localStorage` under a key derived from the form's `name`).
 */
type AutosaveLocalProp =
  | boolean
  | {
      /**
       * The storage key. Defaults to `vueform:{form name}` — without a key or a
       * form `name`, local autosave is disabled with a dev warning.
       */
      key?: string

      /**
       * The storage backend. Defaults to `localStorage`.
       */
      storage?: AutosaveStorage

      /**
       * Whether a stored draft is loaded back into the form on mount. Defaults
       * to `true`. When `false`, drafts can still be loaded manually via
       * `loadAutosaved()`.
       */
      load?: boolean

      /**
       * Whether the stored draft is cleared on successful submit. Defaults to
       * `true`.
       */
      clear?: boolean

      /**
       * Whether the app-level `$security` cipher is applied to this form's
       * draft. Defaults to `true` — and storing drafts with no cipher
       * configured warns in dev: plaintext drafts must be a conscious choice.
       * Set `false` to knowingly store this form's draft as plaintext (and
       * silence the warning); registering identity `$security` ciphers is the
       * app-wide equivalent.
       */
      encrypt?: boolean
    }
```
