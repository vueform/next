````ts
/**
 * Augmentable interface for registering custom validation rule names. Augment
 * this via module declaration merging to add autocomplete for custom rules:
 *
 * ```ts
 * declare module '@vueform/core' {
 *   interface CustomRules {
 *     phone: true
 *     slug: true
 *   }
 * }
 * ```
 */
interface CustomRules {}
````
