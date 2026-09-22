````ts
/**
 * Stores control type component definitions (plain elements, e.g. text, select,
 * button).
 *
 * `TEntry` is the concrete props payload of one usage (a schema entry or an
 * explicit instantiation); registrations map it onto their generic types.
 * Augmentations must repeat the bare `<TEntry>` type parameter:
 *
 * ```ts
 * declare module '@vueform/core' {
 *   interface ControlRegistry<TEntry> {
 *     VfSelect: VfSelectEntry<TEntry>
 *   }
 * }
 * ```
 */
interface ControlRegistry<TEntry = Record<string, any>> {}
````
