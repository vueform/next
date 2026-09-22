import {
  semantic,
  element,
  choices,
  addon,
  group,
  list,
  grid,
  matrix,
  controls,
  form,
  nav,
  blockquote,
  hr,
} from '@vueform/core/tokens'

// ============================================================================
// Primitives
// ----------------------------------------------------------------------------
// Raw design tokens. No references -- concrete values only.
// ============================================================================
const pvPrimitives = {
  // ======== Color ========

  /**
   * Brand primary color.
   */
  brand: 'var(--p-primary-color)',

  /**
   * Red accent color used for danger and error states.
   */
  red: 'var(--p-red-500)',

  /**
   * Green accent color used for success states.
   */
  green: 'var(--p-green-500)',

  /**
   * White.
   */
  white: '#ffffff',

  /**
   * Black.
   */
  black: '#000000',

  /**
   * Neutral gray, 5% dark.
   */
  gray50: 'var(--p-gray-50)',

  /**
   * Neutral gray, 10% dark.
   */
  gray100: 'var(--p-gray-100)',

  /**
   * Neutral gray, 20% dark.
   */
  gray200: 'var(--p-gray-200)',

  /**
   * Neutral gray, 30% dark.
   */
  gray300: 'var(--p-gray-300)',

  /**
   * Neutral gray, 40% dark.
   */
  gray400: 'var(--p-gray-400)',

  /**
   * Neutral gray, 50% dark.
   */
  gray500: 'var(--p-gray-500)',

  /**
   * Neutral gray, 60% dark.
   */
  gray600: 'var(--p-gray-600)',

  /**
   * Neutral gray, 70% dark.
   */
  gray700: 'var(--p-gray-700)',

  /**
   * Neutral gray, 80% dark.
   */
  gray800: 'var(--p-gray-800)',

  /**
   * Neutral gray, 90% dark.
   */
  gray900: 'var(--p-gray-900)',

  /**
   * Neutral gray, 95% dark.
   */
  gray950: 'var(--p-gray-950)',

  // ======== Spacing ========

  /**
   * Default gutter used between elements, groups, list rows, and grid cells.
   */
  gutter: '1rem',

  /**
   * Small spacing unit.
   */
  space1: '1rem',

  /**
   * Medium spacing unit.
   */
  space2: '2rem',

  /**
   * Large spacing unit.
   */
  space3: '3rem',

  /**
   * Vertical spacing around horizontal rules.
   */
  spaceHr: '0.25rem',

  /**
   * Default horizontal padding for inputs and buttons.
   */
  px: 'var(--p-form-field-padding-x)',

  /**
   * Default vertical padding for inputs and buttons.
   */
  py: 'var(--p-form-field-padding-y)',

  // ======== Border ========

  /**
   * Top border width.
   */
  borderWidthT: '1px',

  /**
   * Right border width.
   */
  borderWidthR: '1px',

  /**
   * Bottom border width.
   */
  borderWidthB: '1px',

  /**
   * Left border width.
   */
  borderWidthL: '1px',

  /**
   * Default border radius.
   */
  radius: 'var(--p-border-radius-md)',

  /**
   * Smaller border radius for tight elements.
   */
  radiusSm: 'var(--p-border-radius-sm)',

  /**
   * Larger border radius for loose elements.
   */
  radiusLg: 'var(--p-border-radius-lg)',
}

const pvChoice = {
  // ======== Spacing ========

  /**
   * Gap between the choice input and its label text.
   */
  choiceGutter: '0.375rem',

  /**
   * Top margin applied when a choice is vertically aligned with adjacent
   * inputs.
   */
  choiceAlignedMargin:
    'calc((1lh - var(--p-checkbox-height, 1.25rem)) / 2 + var(--p-inputtext-padding-y)) 0 0 0',
}

const pvColorPicker = {
  /**
   * Top margin applied when a color picker is vertically aligned with adjacent
   * inputs.
   */
  colorPickerAlignedMargin:
    'calc((1lh - var(--p-colorpicker-preview-height)) / 2 + var(--p-inputtext-padding-y) + 1px) 0 0 0',
}

const pvRating = {
  /**
   * Top margin applied when a rating is vertically aligned with adjacent
   * inputs.
   */
  ratingAlignedMargin:
    'calc((1lh - var(--p-rating-icon-size)) / 2 + var(--p-inputtext-padding-y)) 0 0 0',
}

const pvEditor = {
  /**
   * Background of the editor while its Quill instance is loading.
   */
  editorLoadingBg:
    'linear-gradient(90deg, var(--p-surface-200) 0%, var(--p-surface-100) 50%, var(--p-surface-200) 100%)',
}

const pvSlider = {
  /**
   * Padding of the slider's label group in vertical (stacked) layout.
   */
  sliderLabelGroupVPadding: '0 0 $gutter 0',
}

const pvToggleSwitch = {
  /**
   * Size of the icon rendered inside the toggle-switch handle.
   */
  toggleSwitchIconSize: '0.75rem',
  /**
   * Top margin applied when a toggle-switch is vertically aligned with adjacent
   * inputs.
   */
  toggleSwitchAlignedMargin:
    'calc((1lh - var(--p-toggleswitch-height)) / 2 + var(--p-inputtext-padding-y) + 1px) 0 0 0',
}

const pvContent = {
  contentAlignedMargin: 'calc(var(--p-inputtext-padding-y) + 1px) 0 0 0',
}

const pvInfo = {
  /**
   * Font size of the info icon next to labels.
   */
  infoFontSize: '0.875rem',

  /**
   * Margin between the label text and the info icon.
   */
  infoMargin: '0 0 0 5px',
}

const pvTooltip = {
  /**
   * Offset compensating the tooltip's position toward its target.
   */
  tooltipFixSpace: '2px',
}

const pvTabular = {
  // ======== Background ========

  /**
   * Background color of the tabular container.
   */
  tabularBg: 'var(--p-form-field-background)',

  // ======== Color ========

  /**
   * Background color of the tabular container.
   */
  tabularColor: 'var(--p-form-field-color)',

  // ======== Border ========

  /**
   * Border color of the tabular container.
   */
  tabularBorderColor: 'var(--p-form-field-border-color)',

  /**
   * Border width of the tabular container.
   */
  tabularBorderWidth: '1px',

  /**
   * Border style of the tabular container.
   */
  tabularBorderStyle: 'solid',

  /**
   * Border radius of the tabular container.
   */
  tabularRadius: 'var(--p-form-field-border-radius)',

  // ======== Header ========

  /**
   * Font size of tabular header cells.
   */
  tabularHeaderFontSize: '1rem',

  /**
   * Font weight of tabular header cells.
   */
  tabularHeaderFontWeight: '700',

  /**
   * Padding inside tabular header cells.
   */
  tabularHeaderPadding:
    'var(--p-form-field-padding-y) var(--p-form-field-padding-x)',

  /**
   * Background color of column header cells.
   */
  tabularColHeaderBg: '$gray100',

  /**
   * Text color of column header cells.
   */
  tabularColHeaderColor: 'var(--p-form-field-color)',

  /**
   * Border color of column header cells.
   */
  tabularColHeaderBorderColor: 'var(--p-form-field-border-color)',

  /**
   * Background color of row header cells.
   */
  tabularRowHeaderBg: '$gray100',

  /**
   * Text color of row header cells.
   */
  tabularRowHeaderColor: 'var(--p-form-field-color)',

  /**
   * Border color of row header cells.
   */
  tabularRowHeaderBorderColor: 'var(--p-form-field-border-color)',

  // ======== Cell ========

  /**
   * @write
   */
  tabularCellMinHeight: 'calc(1lh + 1rem + 1px)',

  /**
   * Padding inside tabular boxed (non-fluid) input cells .
   */
  tabularBoxedCellPadding: '$px $px',

  /**
   * Padding inside tabular text cells.
   */
  tabularTextCellPadding: '$py $px',
}

const pvSteps = {
  /**
   * Background of a step in vertical steps layout.
   */
  vStepBg: 'transparent',
}

const pvForm = {
  /**
   * Margin around the language tabs container.
   */
  languagesMargin: '0 0 $gutter 0',
}

const pvDark = {
  // ======== Primitives ========
  gray50: 'var(--p-gray-50)',
  gray100: 'var(--p-gray-100)',
  gray200: 'var(--p-gray-200)',
  gray300: 'var(--p-gray-300)',
  gray400: 'var(--p-gray-400)',
  gray500: 'var(--p-gray-500)',
  gray600: 'var(--p-gray-600)',
  gray700: 'var(--p-gray-700)',
  gray800: 'var(--p-gray-800)',
  gray900: 'var(--p-gray-900)',
  gray950: 'var(--p-gray-950)',

  // ======== Semantic ========
  textSoft: '$gray300',

  bgDisabled: '$gray700',
  textDisabled: '$gray500',
  borderDisabled: '$gray600',

  // ======== Layout ========
  elementLineColor: '$gray700',

  // ======== Editor ========
  editorLoadingBg:
    'linear-gradient(90deg, var(--p-surface-600) 0%, var(--p-surface-700) 50%, var(--p-surface-600) 100%)',

  // ======== Group ========
  groupWrappedBorderColor: '$gray600',

  // ======== List ========
  listWrappedBorderColor: '$gray600',

  // ======== Tabular ========
  tabularColHeaderBg: '$gray800',
  tabularRowHeaderBg: '$gray800',

  // ======== Elements ========
  elementLineBorderColor: '$gray600',
}

export const componentTokens = {
  ...element,
  ...choices,
  ...addon,
  ...group,
  ...list,
  ...grid,
  ...matrix,
  ...controls,
  ...form,
  ...nav,
  ...blockquote,
  ...hr,

  ...pvChoice,
  ...pvColorPicker,
  ...pvRating,
  ...pvEditor,
  ...pvSlider,
  ...pvToggleSwitch,
  ...pvContent,
  ...pvTooltip,
  ...pvInfo,
  ...pvTabular,
  ...pvSteps,
  ...pvForm,
}

export const theme = {
  ...pvPrimitives,
  ...semantic,
  ...componentTokens,
  dark: {
    ...pvDark,
  },
}
