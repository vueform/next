```ts
/**
 * Universal SFC-side blueprint consumer: runs the blueprint's `setup` with
 * resolved props and events, and assembles the component's api, parts, classes,
 * outlets, context, and expose object.
 *
 * @param setup Blueprint setup receiving resolved props and events.
 * @param rawProps Raw props from `defineProps` / `withDefaults`.
 * @param events Event emitter from `defineEvents`.
 * @param slots Slot map from `defineSlots` (type-only).
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
  PartsOfProps<LooseRequired<TProps>>,
  ClassesOfProps<LooseRequired<TProps>>,
  TSlots
>
```
