````ts
/**
 * Universal SFC-side blueprint consumer for prop-generic blueprints:
 *
 * ```ts
 * const { api, context } = useBlueprint(
 *   setup,
 *   props,
 *   events,
 *   slots,
 *   extension
 * )
 * ```
 *
 * Takes the blueprint's generic `setup` as a value so `TApi` is instantiated
 * from the SFC's concrete props at the call site. Call-site generic-argument
 * instantiation is the one TypeScript mechanism (besides `typeof setup<TProps>`
 * instantiation expressions) that preserves prop-generic narrowing, and it
 * works with deferred SFC generics (`TItems` etc.), so no per-blueprint
 * `useBlueprint` wrapper is needed.
 *
 * Prop validation flows through the `setup` argument: if the SFC's props don't
 * satisfy the blueprint's loose-props constraint, the error surfaces on `setup`
 * rather than on `rawProps`.
 *
 * Component-level defaults come from Vue's `withDefaults` on the SFC;
 * `useProps` only merges global config defaults and presets.
 *
 * @param setup Blueprint setup receiving resolved props and events.
 * @param rawProps Raw props from `defineProps` / `withDefaults`.
 * @param events Event emitter from `defineEvents`.
 * @param slots Slot map from `defineSlots`. Type-only: it instantiates the
 *   outlets' `TSlots`; the runtime outlets come from `useOutlets` (which reads
 *   the same slots via `useSlots()`).
 * @param extension Optional callback to add or overwrite API members.
 */
function useBlueprint<
  TProps extends Record<string, any>,
  TEvents extends Record<string, any>,
  TApi extends Record<string, any>,
  TSlots extends Record<string, any> = Record<string, any>,
  TExt = void,
>(
  setup: (props: LooseRequired<TProps>, events: TEvents) => TApi,
  rawProps: Readonly<TProps>,
  events: TEvents,
  slots: TSlots = {} as TSlots,
  extension?: BlueprintExtension<TApi, LooseRequired<TProps>, TEvents, TExt>
): Blueprint2Api<
  SpreadMerge<TApi, ResolvedExtension<TExt>>,
  LooseRequired<TProps>,
  TEvents,
  ReturnType<typeof useParts<LooseRequired<TProps>>>,
  ClassesOfProps<LooseRequired<TProps>>,
  TSlots
>
````
