```ts
/**
 * Structural parts of the VfToggleSwitch component.
 */
interface VfToggleSwitchParts extends ToggleSwitchParts {
  /**
   * The toggle switch element.
   *
   * @tag ToggleSwitch
   */
  input: PvToggleSwitchProps

  /**
   * The toggle switch handle element.
   *
   * @tag i
   */
  handle: DomAttrsOf<'i'>
}
```
