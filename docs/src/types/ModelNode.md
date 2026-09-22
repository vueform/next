```ts
/**
 * A node in the schema index: one data-carrying element (leaf or container)
 * with its resolved model metadata. Nodes are created by the schema walk and
 * later claimable by mounted components.
 */
type ModelNode = {
  /**
   * The element path (e.g. `address.city`), including flat containers' names.
   */
  path: string

  /**
   * The data path within the model. Flat containers share their parent's data
   * path (`''` at the root); their children write to the parent's level.
   */
  dataPath: string

  /**
   * The parent node, if any.
   */
  parent?: ModelNode

  /**
   * Child nodes by name (containers only). Array containers key their rows by
   * index (`'0'`, `'1'`, …) as built from the initial row count.
   */
  children?: Map<string, ModelNode>

  /**
   * Whether the node's data lives merged at the parent's level instead of
   * nested under its own key.
   */
  flat: boolean

  /**
   * Whether the node is an array-like container (e.g. list).
   */
  array: boolean

  /**
   * The schema entry type (e.g. `text`, `group`).
   */
  type?: string

  /**
   * The schema-entry props (with `name` applied). Overridable by mounted
   * elements once claimed.
   */
  props: Record<string, any>

  /**
   * The node's null value (containers: the assembled null tree of their
   * children).
   */
  nullValue: any

  /**
   * Whether the node's value is expanded into a locale-keyed object.
   */
  translatable: boolean

  /**
   * Whether the node's data is included in the submit payload.
   */
  submit: boolean

  /**
   * Whether the node's component opted into `default`-value expression tracking
   * (`defineOptions({ expressionable: true })`). Resolved from the component
   * definition by the walk, or set at claim time for registration-created
   * nodes.
   */
  expressionable?: boolean

  /**
   * Whether the node was created by mounted registration (as opposed to the
   * schema walk) — such nodes carry element facts (props, translatability)
   * filled in at claim time and are removed again on unregistration.
   */
  mounted?: boolean

  /**
   * A human-readable name for validation messages, mirroring the mounted
   * `genericName` chain (`displayName` → `label` → `floating` → `floatLabel` →
   * `ifta` → `placeholder` → `name`) for statically resolvable props.
   */
  genericName: string

  /**
   * Validation rules declared on the schema entry.
   */
  rules?: RulesProp | TRulesProp

  /**
   * Conditions declared on the schema entry.
   */
  conditions?: ConditionalProp

  /**
   * Availability resolved by the conditions engine (attached lazily by the
   * model instance; `undefined` means unconditionally available).
   */
  available?: Ref<boolean>

  /**
   * The mounted component context once claimed (form flip phase).
   */
  el$?: object

  /**
   * Expression-tracking state attached by the expression module while the node
   * has tracked templates (`init` sets it, `release` clears it).
   */
  expression?: ExpressionNodeState
}
```
