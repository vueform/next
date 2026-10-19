````ts
/**
 * Assembles a component's `*Context` from its public type surfaces:
 *
 * ```ts
 * interface VfSelectContext<
 *   TProps extends VfSelectProps = VfSelectProps,
 * > extends DefineElementContext<
 *   TProps,
 *   VfSelectEmits,
 *   VfSelectSlots,
 *   VfSelectParts,
 *   VfSelectClasses,
 *   VfSelectModifiers,
 *   VfSelectA11y,
 *   VfSelectExpose,
 *   SelectApi<TProps>
 * > {}
 * ```
 *
 * Bundles the two constructions every context needs:
 *
 * - `NarrowExpose<TExpose, TApi>` — replaces the Expose's wide API members with
 *   the prop-instantiated ones (`TApi` may be an intersection when a component
 *   extension adds members).
 * - `ContextOutlets<TSlots>` for `outlets` — the slot map with every callback
 *   made bivariant. Using the slots interface as-is breaks SFC context
 *   assignability: slot callbacks are contravariant in their context parameter,
 *   so the SFC's narrow slots would not be assignable to the canonical ones.
 *   Method-syntax signatures are exempt from strict contravariance, which keeps
 *   the payload types on `context.outlets.*` without breaking that assignment.
 *
 * The consuming `*Context` must remain an interface (it sits on the recursive
 * props → context → api → props loop); only its body is factored out here.
 *
 * Convention for prop-generic components: type-parameter defaults on the
 * component's `*Props` / `*Emits` / `*Slots` interfaces must be wide (`any`, or
 * helpers that resolve to `any` like select's `ItemValueOf`) — runtime defaults
 * belong in blueprint `defaults` and the SFC's `generic="… = …"` default, and
 * per-usage narrowing in the registry entry's `EntryPropOr` fallbacks. A
 * concrete literal default (e.g. `= true`) makes the bare interface used here
 * concrete, and the SFC's generic-narrowed `defineSlots` then fails to assign
 * to this context's outlets (TS can't relate an open type parameter to a
 * literal in either direction).
 */
type DefineElementContext<
  TProps extends Record<string, any>,
  TEmits extends Record<string, any>,
  TSlots extends Record<string, any>,
  TParts extends Record<string, any>,
  TClasses extends Record<string, any> &
    PartKeyed<TClasses, TParts> &
    ClassShaped<TClasses> &
    PartSymmetric<TClasses, TParts>,
  TModifiers extends PartKeyed<TModifiers, TParts> &
    ModifierShaped<TModifiers> &
    PartSymmetric<TModifiers, TParts>,
  TA11y extends PartKeyed<TA11y, TParts> &
    A11yShaped<TA11y> &
    PartSymmetric<TA11y, TParts>,
  TExpose,
  TApi extends Record<string, any>,
> = BaseElementContext<
  NarrowExpose<TExpose, TApi>,
  TProps,
  TEmits,
  ContextOutlets<TSlots>,
  TParts,
  TClasses,
  TModifiers,
  TA11y
>
````
