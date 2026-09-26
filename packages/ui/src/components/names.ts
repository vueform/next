/**
 * Name-only union of the adapter's components, mirroring `src/components/*`.
 * Kept separate from the component barrel on purpose: importing the barrel
 * would load every component's types and activate ALL type augmentations.
 */
export type ComponentNames =
  | 'VfAddon'
  | 'VfButton'
  | 'VfCheckbox'
  | 'VfCheckboxes'
  | 'VfCol'
  | 'VfContent'
  | 'VfElements'
  | 'VfField'
  | 'VfFile'
  | 'VfForm'
  | 'VfGrid'
  | 'VfGroup'
  | 'VfHidden'
  | 'VfIcon'
  | 'VfLanguages'
  | 'VfLayout'
  | 'VfList'
  | 'VfMatrix'
  | 'VfNav'
  | 'VfRadio'
  | 'VfRadios'
  | 'VfRow'
  | 'VfSelect'
  | 'VfSteps'
  | 'VfTabs'
  | 'VfText'
  | 'VfTextarea'
