// ============================================================================
// Primitives
// ----------------------------------------------------------------------------
// Raw design tokens. No references -- concrete values only.
// ============================================================================
export const primitives = {
  // ======== Color ========

  /**
   * Brand primary color.
   */
  brand: '#000000',

  /**
   * Red accent color used for danger and error states.
   */
  red: '#ef4444',

  /**
   * Green accent color used for success states.
   */
  green: '#22c55e',

  /**
   * Sky blue accent color used for info states.
   */
  sky: '#0ea5e9',

  /**
   * Orange accent color used for warning states.
   */
  orange: '#f97316',

  /**
   * Purple accent color used for help states.
   */
  purple: '#a855f7',

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
  gray50: '#f9fafb',

  /**
   * Neutral gray, 10% dark.
   */
  gray100: '#f3f4f6',

  /**
   * Neutral gray, 20% dark.
   */
  gray200: '#e5e7eb',

  /**
   * Neutral gray, 30% dark.
   */
  gray300: '#d1d5db',

  /**
   * Neutral gray, 40% dark.
   */
  gray400: '#9ca3af',

  /**
   * Neutral gray, 50% dark.
   */
  gray500: '#6b7280',

  /**
   * Neutral gray, 60% dark.
   */
  gray600: '#4b5563',

  /**
   * Neutral gray, 70% dark.
   */
  gray700: '#374151',

  /**
   * Neutral gray, 80% dark.
   */
  gray800: '#1f2937',

  /**
   * Neutral gray, 90% dark.
   */
  gray900: '#111827',

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
  px: '0.75rem',

  /**
   * Default vertical padding for inputs and buttons.
   */
  py: '0.375rem',

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
  radius: '0.375rem',

  /**
   * Smaller border radius for tight elements.
   */
  radiusSm: '0.25rem',

  /**
   * Larger border radius for loose elements.
   */
  radiusLg: '0.75rem',

  // ======== Icons ========

  /**
   * SVG used for "add" affordances (e.g. list add buttons).
   */
  iconAdd:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0V9H2a1 1 0 0 1 0-2h5V2a1 1 0 0 1 1-1z' fill='currentColor'/%3E%3C/svg%3E\")",

  /**
   * SVG used for "remove" affordances.
   */
  iconRemove:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M1.29 1.29a1 1 0 0 1 1.42 0L8 6.59l5.29-5.3a1 1 0 1 1 1.42 1.42L9.41 8l5.3 5.29a1 1 0 0 1-1.42 1.42L8 9.41l-5.29 5.3a1 1 0 0 1-1.42-1.42L6.59 8 1.29 2.71a1 1 0 0 1 0-1.42z' fill='currentColor'/%3E%3C/svg%3E\")",

  /**
   * SVG used for the list sort handle.
   */
  iconSort:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect x='0' y='3' width='16' height='2' rx='1' fill='currentColor'/%3E%3Crect x='0' y='7' width='16' height='2' rx='1' fill='currentColor'/%3E%3Crect x='0' y='11' width='16' height='2' rx='1' fill='currentColor'/%3E%3C/svg%3E\")",

  /**
   * SVG used for the loading spinner.
   */
  iconLoading:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6.5' fill='none' stroke='currentColor' stroke-width='1.5' stroke-dasharray='30.6 10.2' stroke-linecap='round'/%3E%3C/svg%3E\")",
}

// ============================================================================
// Semantic
// ----------------------------------------------------------------------------
// Purpose-based tokens. References only primitives (never component tokens).
// ============================================================================
export const semantic = {
  // ======== Disabled Colors ========

  /**
   * Text color of disabled controls.
   */
  textDisabled: '$gray400',

  /**
   * Background of disabled inputs and choices.
   */
  bgDisabled: '$gray100',

  /**
   * Border color of disabled inputs and choices.
   */
  borderDisabled: '$gray300',

  // ======== Text Colors ========

  /**
   * Muted text color used by help and description.
   */
  textSoft: '$gray500',

  /**
   * Color used for links inside form text.
   */
  linkColor: '$brand',

  // ======== Size ========

  /**
   * Default width for inline icons.
   */
  iconWidth: '0.75rem',

  /**
   * Default height for inline icons.
   */
  iconHeight: '0.75rem',
}

// ============================================================================
// Component Based
// ----------------------------------------------------------------------------
// Component-level tokens. References only semantic or primitive tokens --
// NEVER other component-group tokens. This allows per-component `theme`
// overrides to work correctly without cascading aliases.
// ============================================================================

export const element = {
  // ======== Label ========

  /**
   * Font size of element labels.
   */
  labelFontSize: '1rem',

  /**
   * Font weight of element labels.
   */
  labelFontWeight: '600',

  /**
   * Padding for vertical labels within group elements.
   */
  labelGroupVPadding: '0 0 0.375rem 0',

  /**
   * Padding for horizontal labels within group elements.
   */
  labelGroupHPadding: 'calc($py + $borderWidthT) 0 0 0',

  // ======== Required ========

  /**
   * CSS content value for the required indicator.
   */
  requiredContent: "'*'",

  /**
   * Width of the required indicator.
   */
  requiredW: 'auto',

  /**
   * Height of the required indicator.
   */
  requiredH: 'auto',

  /**
   * Background color of the required indicator.
   */
  requiredBg: 'transparent',

  /**
   * Text color of the required indicator.
   */
  requiredColor: 'inherit',

  /**
   * Mask image icon for the required indicator.
   */
  requiredIcon: 'none',

  // ======== Help ========

  /**
   * Font size of help text below elements.
   */
  helpFontSize: '0.875rem',

  /**
   * Padding around the help text block.
   */
  helpPadding: '0',

  /**
   * Background color of the help text block.
   */
  helpBg: 'transparent',

  /**
   * Text color of help text.
   */
  helpColor: '$textSoft',

  /**
   * Border color of the help text block.
   */
  helpBorderColor: 'transparent',

  /**
   * Border style of the help text block.
   */
  helpBorderStyle: 'solid',

  /**
   * Border width of the help text block.
   */
  helpBorderWidth: '0',

  /**
   * Border radius of the help text block.
   */
  helpRadius: '$radius',

  // ==== Description =====

  /**
   * Font size of description text within elements.
   */
  descriptionFontSize: '0.875rem',

  /**
   * Padding around the description text block.
   */
  descriptionPadding: '0',

  /**
   * Background color of the description text block.
   */
  descriptionBg: 'transparent',

  /**
   * Text color of description text.
   */
  descriptionColor: '$textSoft',

  /**
   * Border color of the description text block.
   */
  descriptionBorderColor: 'transparent',

  /**
   * Border style of the description text block.
   */
  descriptionBorderStyle: 'solid',

  /**
   * Border width of the description text block.
   */
  descriptionBorderWidth: '0',

  /**
   * Border radius of the description text block.
   */
  descriptionRadius: '$radius',

  // ======== Errors ========

  /**
   * Font size of error messages within elements.
   */
  errorsFontSize: '0.875rem',

  /**
   * Padding around the error messages block.
   */
  errorsPadding: '0',

  /**
   * Background color of the error messages block.
   */
  errorsBg: 'transparent',

  /**
   * Text color of error messages.
   */
  errorsColor: '$red',

  /**
   * Border color of the error messages block.
   */
  errorsBorderColor: 'transparent',

  /**
   * Border style of the error messages block.
   */
  errorsBorderStyle: 'solid',

  /**
   * Border width of the error messages block.
   */
  errorsBorderWidth: '0',

  /**
   * Border radius of the error messages block.
   */
  errorsRadius: '$radius',

  // ======== Messages ========

  /**
   * Font size of informational messages within elements.
   */
  messagesFontSize: '0.875rem',

  /**
   * Padding around the messages block.
   */
  messagesPadding: '0',

  /**
   * Background color of the messages block.
   */
  messagesBg: 'transparent',

  /**
   * Text color of informational messages.
   */
  messagesColor: '$green',

  /**
   * Border color of the messages block.
   */
  messagesBorderColor: '$borderSuccess',

  /**
   * Border style of the messages block.
   */
  messagesBorderStyle: 'solid',

  /**
   * Border width of the messages block.
   */
  messagesBorderWidth: '0',

  /**
   * Border radius of the messages block.
   */
  messagesRadius: '$radius',

  // ======== Layout ========

  /**
   * Border color for horizontal divider lines between elements.
   */
  elementLineColor: '$gray300',
}

export const input = {
  // ======== Spacing ========

  /**
   * Top padding of the input.
   */
  inputPt: '$py',

  /**
   * Right padding of the input.
   */
  inputPr: '$px',

  /**
   * Bottom padding of the input.
   */
  inputPb: '$py',

  /**
   * Left padding of the input.
   */
  inputPl: '$px',

  // ======== Ring ========

  /**
   * Width of the focus ring around the input.
   */
  inputRingWidth: '1px',

  /**
   * Border style of the focus ring around the input.
   */
  inputRingStyle: 'solid',

  /**
   * Offset of the focus ring from the input edge.
   */
  inputRingOffset: '-1px',

  /**
   * Color of the focus ring around the input.
   */
  inputRingColor: '$brand',

  /**
   * Box shadow of the focus ring around the input.
   */
  inputRingShadow: 'none',

  /**
   * Color of the focus ring around the input in an error state.
   */
  inputRingColorDanger: '$brand',

  /**
   * Box shadow of the focus ring around the input in an error state.
   */
  inputRingShadowDanger: 'none',

  // ======== Background ========

  /**
   * Background color of the input.
   */
  inputBg: '$white',

  /**
   * Background color of the input when autofilled by the browser.
   */
  inputBgAutofill: '$white',

  /**
   * Background color of the input in an error state.
   */
  inputBgDanger: '$white',

  /**
   * Background color of the input when disabled.
   */
  inputBgDisabled: '$bgDisabled',

  // ======== Color ========

  /**
   * Text color of the input.
   */
  inputColor: '$gray800',

  /**
   * Text color of the input when autofilled by the browser.
   */
  inputColorAutofill: '$gray800',

  /**
   * Text color of the input in an error state.
   */
  inputColorDanger: '$gray800',

  /**
   * Text color of the input when disabled.
   */
  inputColorDisabled: '$textDisabled',

  // ======== Border ========

  /**
   * Border color of the input.
   */
  inputBorderColor: '$gray300',

  /**
   * Border color of the input in an error state.
   */
  inputBorderColorDanger: '$gray300',

  /**
   * Border color of the input when disabled.
   */
  inputBorderColorDisabled: '$borderDisabled',

  /**
   * Border style of the input.
   */
  inputBorderStyle: 'solid',

  /**
   * Top border width of the input.
   */
  inputBorderWidthT: '$borderWidthT',

  /**
   * Right border width of the input.
   */
  inputBorderWidthR: '$borderWidthR',

  /**
   * Bottom border width of the input.
   */
  inputBorderWidthB: '$borderWidthB',

  /**
   * Left border width of the input.
   */
  inputBorderWidthL: '$borderWidthL',

  /**
   * Border radius of the input.
   */
  inputRadius: '$radius',

  // ======== Shadow ========

  /**
   * Box shadow of the input.
   */
  inputShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
}

export const select = {
  // ======== Size ========

  /**
   * Width of the select caret icon.
   */
  selectIconWidth: '0.5rem',

  /**
   * Height of the select caret icon.
   */
  selectIconHeight: '0.625rem',

  // ======== Color ========

  /**
   * Placeholder text color in the select.
   */
  selectPlaceholderColor: '$gray500',

  // ======== Icons ========

  /**
   * SVG icon used for the select dropdown caret.
   */
  selectIconCaret:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 12' fill='none' stroke='%234b5563' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 4.5L5 1l4 3.5'/%3E%3Cpath d='M1 7.5L5 11l4-3.5'/%3E%3C/svg%3E\")",
}

export const choice = {
  // ======== Size ========

  /**
   * Width of the checkbox or radio input.
   */
  choiceWidth: '1rem',

  /**
   * Height of the checkbox or radio input.
   */
  choiceHeight: '1rem',

  // ======== Spacing ========

  /**
   * Gap between the choice input and its label text.
   */
  choiceGutter: '0.375rem',

  /**
   * Margin of a choice in aligned layout, vertically centering it with the
   * first text line of adjacent input fields.
   */
  choiceAlignedMargin:
    'calc((1lh - ($choiceHeight + $choiceBorderWidthT)) / 2 + $inputPt) 0 0 0',

  // ======== Ring ========

  /**
   * Width of the focus ring around the choice input.
   */
  choiceRingWidth: '1px',

  /**
   * Border style of the focus ring around the choice input.
   */
  choiceRingStyle: 'solid',

  /**
   * Offset of the focus ring from the choice input edge.
   */
  choiceRingOffset: '-1px',

  /**
   * Color of the focus ring around the choice input.
   */
  choiceRingColor: '$brand',

  /**
   * Box shadow of the focus ring around the choice input.
   */
  choiceRingShadow: 'none',

  /**
   * Color of the focus ring around the choice input in an error state.
   */
  choiceRingColorDanger: '$brand',

  /**
   * Box shadow of the focus ring around the choice input in an error state.
   */
  choiceRingShadowDanger: 'none',

  // ======== Background ========

  /**
   * Background color of the choice input.
   */
  choiceBg: '$white',

  /**
   * Background color of the choice input in an error state.
   */
  choiceBgDanger: '$white',

  /**
   * Background color of the choice input when disabled.
   */
  choiceBgDisabled: '$bgDisabled',

  /**
   * Background color of the choice input when checked.
   */
  choiceBgChecked: '$brand',

  /**
   * Background color of the choice input when checked in an error state.
   */
  choiceBgCheckedDanger: '$brand',

  /**
   * Background color of the choice input when checked and disabled.
   */
  choiceBgCheckedDisabled: '$gray400',

  // ======== Color ========

  /**
   * Text color of the choice label.
   */
  choiceColor: 'inherit',

  /**
   * Icon color inside the checked choice input.
   */
  choiceIconColor: '$white',

  /**
   * Icon color inside the checked choice input when disabled.
   */
  choiceIconColorDisabled: '$white',

  /**
   * Icon color inside the checked choice input in an error state.
   */
  choiceIconColorDanger: '$white',

  // ======== Border ========

  /**
   * Border color of the choice input.
   */
  choiceBorderColor: '$gray300',

  /**
   * Border color of the choice input in an error state.
   */
  choiceBorderColorDanger: '$gray300',

  /**
   * Border color of the choice input when disabled.
   */
  choiceBorderColorDisabled: '$borderDisabled',

  /**
   * Border color of the choice input when checked.
   */
  choiceBorderColorChecked: '$brand',

  /**
   * Border color of the choice input when checked in an error state.
   */
  choiceBorderColorCheckedDanger: '$brand',

  /**
   * Border color of the choice input when checked and disabled.
   */
  choiceBorderColorCheckedDisabled: '$gray400',

  /**
   * Top border width of the choice input.
   */
  choiceBorderWidthT: '1px',

  /**
   * Right border width of the choice input.
   */
  choiceBorderWidthR: '1px',

  /**
   * Bottom border width of the choice input.
   */
  choiceBorderWidthB: '1px',

  /**
   * Left border width of the choice input.
   */
  choiceBorderWidthL: '1px',

  /**
   * Border radius of the choice input.
   */
  choiceRadius: '$radiusSm',

  // ======== Shadow ========

  /**
   * Box shadow of the choice input.
   */
  choiceShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',

  // ======== Icons ========

  /**
   * SVG icon displayed when a checkbox is checked.
   */
  choiceIconChecked:
    "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")",

  /**
   * SVG icon displayed when a radio option is selected.
   */
  choiceIconSelected:
    "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3.5'/%3e%3c/svg%3e\")",
}

export const choices = {
  // ======== Spacing ========

  /**
   * Horizontal gap between choice items.
   */
  choicesGutterX: '0.75rem',

  /**
   * Vertical gap between choice items.
   */
  choicesGutterY: '0.25rem',

  /**
   * Layout direction of choice items (row or column).
   */
  choicesDirection: 'column',
}

export const file = {
  // ======== Spacing ========

  /**
   * Horizontal gap between file items in the file list.
   */
  fileGutterX: 'calc($gutter / 2)',

  /**
   * Vertical gap between file items in the file list.
   */
  fileGutterY: 'calc($gutter / 2)',

  /**
   * Margin below the file list container.
   */
  fileMargin: '0 0 calc($gutter / 2) 0',

  /**
   * Horizontal padding within a single file item.
   */
  fileItemGutterX: 'calc($gutter / 2)',

  /**
   * Vertical padding within a single file item.
   */
  fileItemGutterY: 'calc($gutter / 2)',
}

export const content = {
  /**
   * Margin of static content in aligned layout, aligning its first text line
   * with the text of adjacent input fields.
   */
  contentAlignedMargin: 'calc($inputPt + $inputBorderWidthT) 0 0 0',
}

export const button = {
  // ======== Typography ========

  /**
   * Font size of buttons.
   */
  btnFontSize: '1rem',

  /**
   * Font size of buttons.
   */
  btnFontSizeSm: '0.875rem',

  // ======== Size ========

  /**
   * Width of the button.
   */
  btnWidth: 'auto',

  // ======== Spacing ========

  /**
   * Horizontal gap between icon and text inside a button.
   */
  btnGutterX: '0.5rem',

  /**
   * Vertical gap between icon and text inside a button.
   */
  btnGutterY: '0',

  /**
   * Horizontal gap between icon and text inside a small button.
   */
  btnGutterXSm: '0.5rem',

  /**
   * Vertical gap between icon and text inside a small button.
   */
  btnGutterYSm: '0',

  /**
   * Vertical padding of the button.
   */
  btnPaddingY: '$py',

  /**
   * Horizontal padding of the button.
   */
  btnPaddingX: '$px',

  /**
   * Vertical padding of small buttons.
   */
  btnPaddingYSm: '0.125rem',

  /**
   * Horizontal padding of small buttons.
   */
  btnPaddingXSm: '0.5rem',

  // ======== Ring ========

  /**
   * Width of the focus ring around buttons.
   */
  btnRingWidth: '1px',

  /**
   * Border style of the focus ring around buttons.
   */
  btnRingStyle: 'solid',

  /**
   * Offset of the focus ring from the button edge.
   */
  btnRingOffset: '1px',

  // ======== Disabled ========

  /**
   * Opacity applied to disabled buttons.
   */
  btnDisabledOpacity: '0.6',

  /**
   * Background opacity percentage for outline button fills.
   */
  btnOutlineBgPercent: '15%',

  /**
   * Transparency percentage for outline button backgrounds.
   */
  btnOutlineTransparentPercent: '100%',

  // ======== Primary ========

  /**
   * Background color of primary buttons.
   */
  btnBgPrimary: '$brand',

  /**
   * Text color of primary buttons.
   */
  btnColorPrimary: '$white',

  /**
   * Border color of primary buttons.
   */
  btnBorderColorPrimary: '$brand',

  /**
   * Outline color of primary buttons.
   */
  btnOutlinePrimary: '$brand',

  /**
   * Background color of primary buttons on hover.
   */
  btnBgPrimaryHover: 'color-mix(in srgb, $brand 100%, black 15%)',

  /**
   * Text color of primary buttons on hover.
   */
  btnColorPrimaryHover: '$white',

  /**
   * Border color of primary buttons on hover.
   */
  btnBorderColorPrimaryHover: 'color-mix(in srgb, $brand 100%, black 15%)',

  /**
   * Outline color of primary buttons on hover.
   */
  btnOutlinePrimaryHover: '$brand',

  /**
   * Focus ring color of primary buttons.
   */
  btnRingColorPrimary: '$brand',

  /**
   * Focus ring shadow of primary buttons.
   */
  btnRingShadowPrimary: 'none',

  // ======== Secondary ========

  /**
   * Background color of secondary buttons.
   */
  btnBgSecondary: '$gray200',

  /**
   * Text color of secondary buttons.
   */
  btnColorSecondary: '$gray700',

  /**
   * Border color of secondary buttons.
   */
  btnBorderColorSecondary: '$gray200',

  /**
   * Outline color of secondary buttons.
   */
  btnOutlineSecondary: '$gray400',

  /**
   * Background color of secondary buttons on hover.
   */
  btnBgSecondaryHover: '$gray300',

  /**
   * Text color of secondary buttons on hover.
   */
  btnColorSecondaryHover: '$gray700',

  /**
   * Border color of secondary buttons on hover.
   */
  btnBorderColorSecondaryHover: '$gray300',

  /**
   * Outline color of secondary buttons on hover.
   */
  btnOutlineSecondaryHover: '$gray400',

  /**
   * Focus ring color of secondary buttons.
   */
  btnRingColorSecondary: '$gray200',

  /**
   * Focus ring shadow of secondary buttons.
   */
  btnRingShadowSecondary: 'none',

  // ======== Success ========

  /**
   * Background color of success buttons.
   */
  btnBgSuccess: '$green',

  /**
   * Text color of success buttons.
   */
  btnColorSuccess: '$white',

  /**
   * Border color of success buttons.
   */
  btnBorderColorSuccess: '$green',

  /**
   * Outline color of success buttons.
   */
  btnOutlineSuccess: '$green',

  /**
   * Background color of success buttons on hover.
   */
  btnBgSuccessHover: 'color-mix(in srgb, $green 100%, black 15%)',

  /**
   * Text color of success buttons on hover.
   */
  btnColorSuccessHover: '$white',

  /**
   * Border color of success buttons on hover.
   */
  btnBorderColorSuccessHover: 'color-mix(in srgb, $green 100%, black 15%)',

  /**
   * Outline color of success buttons on hover.
   */
  btnOutlineSuccessHover: '$green',

  /**
   * Focus ring color of success buttons.
   */
  btnRingColorSuccess: '$green',

  /**
   * Focus ring shadow of success buttons.
   */
  btnRingShadowSuccess: 'none',

  // ======== Info ========

  /**
   * Background color of info buttons.
   */
  btnBgInfo: '$sky',

  /**
   * Text color of info buttons.
   */
  btnColorInfo: '$white',

  /**
   * Border color of info buttons.
   */
  btnBorderColorInfo: '$sky',

  /**
   * Outline color of info buttons.
   */
  btnOutlineInfo: '$sky',

  /**
   * Background color of info buttons on hover.
   */
  btnBgInfoHover: 'color-mix(in srgb, $sky 100%, black 15%)',

  /**
   * Text color of info buttons on hover.
   */
  btnColorInfoHover: '$white',

  /**
   * Border color of info buttons on hover.
   */
  btnBorderColorInfoHover: 'color-mix(in srgb, $sky 100%, black 15%)',

  /**
   * Outline color of info buttons on hover.
   */
  btnOutlineInfoHover: '$sky',

  /**
   * Focus ring color of info buttons.
   */
  btnRingColorInfo: '$sky',

  /**
   * Focus ring shadow of info buttons.
   */
  btnRingShadowInfo: 'none',

  // ======== Warn ========

  /**
   * Background color of warning buttons.
   */
  btnBgWarn: '$orange',

  /**
   * Text color of warning buttons.
   */
  btnColorWarn: '$white',

  /**
   * Border color of warning buttons.
   */
  btnBorderColorWarn: '$orange',

  /**
   * Outline color of warning buttons.
   */
  btnOutlineWarn: '$orange',

  /**
   * Background color of warning buttons on hover.
   */
  btnBgWarnHover: 'color-mix(in srgb, $orange 100%, black 15%)',

  /**
   * Text color of warning buttons on hover.
   */
  btnColorWarnHover: '$white',

  /**
   * Border color of warning buttons on hover.
   */
  btnBorderColorWarnHover: 'color-mix(in srgb, $orange 100%, black 15%)',

  /**
   * Outline color of warning buttons on hover.
   */
  btnOutlineWarnHover: '$orange',

  /**
   * Focus ring color of warning buttons.
   */
  btnRingColorWarn: '$orange',

  /**
   * Focus ring shadow of warning buttons.
   */
  btnRingShadowWarn: 'none',

  // ======== Help ========

  /**
   * Background color of help buttons.
   */
  btnBgHelp: '$purple',

  /**
   * Text color of help buttons.
   */
  btnColorHelp: '$white',

  /**
   * Border color of help buttons.
   */
  btnBorderColorHelp: '$purple',

  /**
   * Outline color of help buttons.
   */
  btnOutlineHelp: '$purple',

  /**
   * Background color of help buttons on hover.
   */
  btnBgHelpHover: 'color-mix(in srgb, $purple 100%, black 15%)',

  /**
   * Text color of help buttons on hover.
   */
  btnColorHelpHover: '$white',

  /**
   * Border color of help buttons on hover.
   */
  btnBorderColorHelpHover: 'color-mix(in srgb, $purple 100%, black 15%)',

  /**
   * Outline color of help buttons on hover.
   */
  btnOutlineHelpHover: '$purple',

  /**
   * Focus ring color of help buttons.
   */
  btnRingColorHelp: '$purple',

  /**
   * Focus ring shadow of help buttons.
   */
  btnRingShadowHelp: 'none',

  // ======== Danger ========

  /**
   * Background color of danger buttons.
   */
  btnBgDanger: '$red',

  /**
   * Text color of danger buttons.
   */
  btnColorDanger: '$white',

  /**
   * Border color of danger buttons.
   */
  btnBorderColorDanger: '$red',

  /**
   * Outline color of danger buttons.
   */
  btnOutlineDanger: '$red',

  /**
   * Background color of danger buttons on hover.
   */
  btnBgDangerHover: 'color-mix(in srgb, $red 100%, black 15%)',

  /**
   * Text color of danger buttons on hover.
   */
  btnColorDangerHover: '$white',

  /**
   * Border color of danger buttons on hover.
   */
  btnBorderColorDangerHover: 'color-mix(in srgb, $red 100%, black 15%)',

  /**
   * Outline color of danger buttons on hover.
   */
  btnOutlineDangerHover: '$red',

  /**
   * Focus ring color of danger buttons.
   */
  btnRingColorDanger: '$red',

  /**
   * Focus ring shadow of danger buttons.
   */
  btnRingShadowDanger: 'none',

  // ======== Contrast ========

  /**
   * Background color of contrast buttons.
   */
  btnBgContrast: '$gray900',

  /**
   * Text color of contrast buttons.
   */
  btnColorContrast: '$white',

  /**
   * Border color of contrast buttons.
   */
  btnBorderColorContrast: '$gray900',

  /**
   * Outline color of contrast buttons.
   */
  btnOutlineContrast: '$gray900',

  /**
   * Background color of contrast buttons on hover.
   */
  btnBgContrastHover: '$gray800',

  /**
   * Text color of contrast buttons on hover.
   */
  btnColorContrastHover: '$white',

  /**
   * Border color of contrast buttons on hover.
   */
  btnBorderColorContrastHover: '$gray800',

  /**
   * Outline color of contrast buttons on hover.
   */
  btnOutlineContrastHover: '$gray900',

  /**
   * Focus ring color of contrast buttons.
   */
  btnRingColorContrast: '$gray900',

  /**
   * Focus ring shadow of contrast buttons.
   */
  btnRingShadowContrast: 'none',

  // ======== Border ========

  /**
   * Border width of buttons.
   */
  btnBorderWidth: '1px',

  /**
   * Border style of buttons.
   */
  btnBorderStyle: 'solid',

  /**
   * Border radius of buttons.
   */
  btnRadius: '$radius',

  /**
   * Border radius of small buttons.
   */
  btnRadiusSm: '$radiusSm',

  // ======== Shadow ========

  /**
   * Box shadow of buttons.
   */
  btnShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
}

export const addon = {
  // ======== Spacing ========

  /**
   * Padding for the before (left) addon.
   */
  addonBeforePadding: '0 $px',

  /**
   * Margin for the before (left) addon.
   */
  addonBeforeMargin: '0',

  /**
   * Padding for the after (right) addon.
   */
  addonAfterPadding: '0 $px',

  /**
   * Margin for the after (right) addon.
   */
  addonAfterMargin: '0',

  // ======== Background ========

  /**
   * Background color of addons.
   */
  addonBg: '$white',

  /**
   * Background color of addons in an error state.
   */
  addonBgDanger: '$white',

  // ======== Color ========

  /**
   * Text color of addons.
   */
  addonColor: 'inherit',

  /**
   * Text color of addons in an error state.
   */
  addonColorDanger: 'inherit',

  // ======== Border ========

  /**
   * Border color of addons.
   */
  addonBorderColor: '$gray300',

  /**
   * Border color of addons in an error state.
   */
  addonBorderColorDanger: '$gray300',

  /**
   * Border style of addons.
   */
  addonBorderStyle: 'solid',

  /**
   * Border width of addons.
   */
  addonBorderWidth: '1px',

  /**
   * Border radius of addons.
   */
  addonRadius: 'calc($radius - $borderWidthT)',
}

export const icon = {
  /**
   * The font size of the icons.
   */
  iconFontSize: '0.875rem',

  /**
   * Fixed width of the icon cell inside the icon group.
   */
  iconGroupWidth: '2.5rem',

  /**
   * Color of icons inside the icon group.
   */
  iconGroupColor: 'inherit',

  /**
   * Color of icons when the input has a validation error.
   */
  iconGroupColorDanger: '$colorDanger',
}

export const group = {
  // ======== Spacing ========

  /**
   * Horizontal gap between elements in a group.
   */
  groupGutterX: '$gutter',

  /**
   * Vertical gap between elements in a group.
   */
  groupGutterY: '$gutter',

  /**
   * Grid template columns for the group layout.
   */
  groupGridTemplateColumns: 'repeat(12, minmax(0, 1fr))',

  /**
   * Horizontal gap between elements in a stacked group.
   */
  groupGutterStackedX: 'calc($gutter * 0.66)',

  /**
   * Vertical gap between elements in a stacked group.
   */
  groupGutterStackedY: 'calc($gutter * 0.66)',

  // ======== Wrapped ========

  /**
   * Padding inside a wrapped group container.
   */
  groupWrappedPadding: '1.5rem',

  /**
   * Border width of a wrapped group container.
   */
  groupWrappedBorderWidth: '1px',

  /**
   * Border color of a wrapped group container.
   */
  groupWrappedBorderColor: '$gray300',

  /**
   * Border style of a wrapped group container.
   */
  groupWrappedBorderStyle: 'solid',

  /**
   * Border radius of a wrapped group container.
   */
  groupWrappedRadius: '$radius',

  /**
   * Background color of a wrapped group container.
   */
  groupWrappedBg: 'transparent',
}

export const list = {
  // ======== Spacing ========

  /**
   * Horizontal gap between list rows.
   */
  listGutterX: '$gutter',

  /**
   * Vertical gap between list rows.
   */
  listGutterY: '$gutter',

  /**
   * Horizontal gap within a list item row.
   */
  listItemGutterX: '$gutter',

  /**
   * Vertical gap within a list item row.
   */
  listItemGutterY: '0',

  /**
   * Vertical alignment of list item content.
   */
  listItemAlign: 'center',

  // ======== Placeholder ========

  /**
   * Background color of the empty list placeholder.
   */
  listPlaceholderBg: 'transparent',

  /**
   * Border width of the empty list placeholder.
   */
  listPlaceholderBorderWidth: '0',

  /**
   * Border color of the empty list placeholder.
   */
  listPlaceholderBorderColor: 'transparent',

  /**
   * Border style of the empty list placeholder.
   */
  listPlaceholderBorderStyle: 'solid',

  /**
   * Border radius of the empty list placeholder.
   */
  listPlaceholderRadius: '$radius',

  /**
   * Font style of the empty list placeholder text.
   */
  listPlaceholderFontStyle: 'italic',

  /**
   * Text color of the empty list placeholder.
   */
  listPlaceholderColor: '$gray500',

  /**
   * Text alignment of the empty list placeholder.
   */
  listPlaceholderAlign: 'left',

  /**
   * Padding of the empty list placeholder.
   */
  listPlaceholderPadding: 'calc($py + $borderWidthT + $borderWidthB) 0',

  // ======== Add ========

  /**
   * Margin above the add button below the list.
   */
  listAddMargin: 'calc($gutter * 0.66) 0 0 0',

  // ======== Drag ========

  /**
   * Opacity of dragged element while dragging.
   */
  listDraggingOpacity: '0.6',
}

export const grid = {
  // ======== Spacing ========

  /**
   * Horizontal gap between grid cells.
   */
  gridGutterX: '$gutter',

  /**
   * Vertical gap between grid rows.
   */
  gridGutterY: '$gutter',

  // ======== Headers ========

  /**
   * Font size of grid header cells.
   */
  gridHeaderFontSize: '1rem',

  /**
   * Font weight of grid header cells.
   */
  gridHeaderFontWeight: '700',

  /**
   * Text color of column header cells.
   */
  gridColHeaderColor: 'inherit',

  /**
   * Text color of row header cells.
   */
  gridRowHeaderColor: 'inherit',
}

export const matrix = {
  // ======== Spacing ========

  /**
   * Horizontal gap between matrix cells.
   */
  matrixGutterX: '$gutter',

  /**
   * Vertical gap between matrix rows.
   */
  matrixGutterY: '$gutter',

  // ======== Headers ========

  /**
   * Font size of matrix header cells.
   */
  matrixHeaderFontSize: '1rem',

  /**
   * Font weight of matrix header cells.
   */
  matrixHeaderFontWeight: '700',

  /**
   * Text color of matrix column headers.
   */
  matrixColHeaderColor: 'inherit',

  /**
   * Text color of matrix row headers.
   */
  matrixRowHeaderColor: 'inherit',

  // ======== Add ========

  /**
   * Margin above the add button below the matrix.
   */
  matrixAddMargin: '$gutter 0 0 0',

  // ======== Drag ========

  /**
   * Opacity of dragged row while dragging.
   */
  matrixDraggingOpacity: '0.6',
}

export const tabular = {
  // ======== Background ========

  /**
   * Background color of the tabular container.
   */
  tabularBg: '$white',

  // ======== Color ========

  /**
   * Text color of tabular cells.
   */
  tabularColor: '$gray800',

  // ======== Border ========

  /**
   * Border color of the tabular container.
   */
  tabularBorderColor: '$gray300',

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
  tabularRadius: '$radius',

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
  tabularHeaderPadding: '$py $px',

  /**
   * Background color of column header cells.
   */
  tabularColHeaderBg: '$gray100',

  /**
   * Text color of column header cells.
   */
  tabularColHeaderColor: 'inherit',

  /**
   * Border color of column header cells.
   */
  tabularColHeaderBorderColor: '$gray300',

  /**
   * Background color of row header cells.
   */
  tabularRowHeaderBg: '$gray100',

  /**
   * Text color of row header cells.
   */
  tabularRowHeaderColor: 'inherit',

  /**
   * Border color of row header cells.
   */
  tabularRowHeaderBorderColor: '$gray300',

  // ======== Cell ========

  /**
   * Minimum height of a tabular cell, matching the height of a bordered input.
   */
  tabularCellMinHeight:
    'calc(1lh + var(--vf-input-pt) + var(--vf-input-pb) + var(--vf-input-border-width-t) + var(--vf-input-border-width-b))',

  /**
   * Padding inside tabular boxed (non-fluid) input cells .
   */
  tabularBoxedCellPadding:
    'calc((1lh + var(--vf-input-pt) + var(--vf-input-pb) - var(--vf-choice-height) - var(--vf-choice-border-width-t) - var(--vf-choice-border-width-b)) / 2)',

  /**
   * Padding inside tabular header cells.
   */
  tabularTextCellPadding: '$py $px',
}

export const controls = {
  // ======== Size ========

  /**
   * Minimum width of control buttons (remove, sort).
   */
  controlMinWidth: '1.25rem',

  /**
   * Minimum height of control buttons.
   */
  controlMinHeight: '1.25rem',

  /**
   * Width of the icon inside control buttons.
   */
  controlIconWidth: '0.625rem',

  /**
   * Height of the icon inside control buttons.
   */
  controlIconHeight: '0.625rem',

  // ======== Icons ========

  /**
   * SVG icon for the remove control.
   */
  controlIconRemove: '$iconRemove',

  /**
   * SVG icon for the sort control.
   */
  controlIconSort: '$iconSort',

  // ======== Shadow ========

  /**
   * Box shadow of control buttons.
   */
  controlShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',

  // ======== Background ========

  /**
   * Background color of control buttons.
   */
  controlBg: '$gray200',

  /**
   * Background color of control buttons on hover.
   */
  controlBgHover: '$gray300',

  // ======== Color ========

  /**
   * Icon color of control buttons.
   */
  controlColor: '$gray900',

  /**
   * Icon color of control buttons on hover.
   */
  controlColorHover: '$gray900',

  // ======== Border ========

  /**
   * Border color of control buttons.
   */
  controlBorderColor: '$gray200',

  /**
   * Border color of control buttons on hover.
   */
  controlBorderColorHover: '$gray300',

  /**
   * Border width of control buttons.
   */
  controlBorderWidth: '1px',

  /**
   * Border style of control buttons.
   */
  controlBorderStyle: 'solid',

  /**
   * Border radius of control buttons.
   */
  controlRadius: '$radiusSm',
}

export const form = {
  // ======== Errors ========

  /**
   * Margin around the form-level error message list.
   */
  formErrorsMargin: '0 0 $gutter 0',

  /**
   * Padding inside the form-level error message container.
   */
  formErrorsPadding: '0.5rem 0.75rem',

  /**
   * Background color of the form-level error container.
   */
  formErrorsBg: 'color-mix(in srgb, $red 10%, transparent)',

  /**
   * Text color of form-level error messages.
   */
  formErrorsColor: '$red',

  /**
   * Border color of the form-level error container.
   */
  formErrorsBorderColor: '$red',

  /**
   * Border style of the form-level error container.
   */
  formErrorsBorderStyle: 'solid',

  /**
   * Border width of the form-level error container.
   */
  formErrorsBorderWidth: '1px',

  /**
   * Border radius of the form-level error container.
   */
  formErrorsRadius: '$radius',

  // ======== Messages ========

  /**
   * Margin around the form-level message list.
   */
  formMessagesMargin: '0 0 $gutter 0',

  /**
   * Padding inside the form-level message container.
   */
  formMessagesPadding: '0.5rem 0.75rem',

  /**
   * Background color of the form-level message container.
   */
  formMessagesBg: 'color-mix(in srgb, $green 10%, transparent)',

  /**
   * Text color of form-level informational messages.
   */
  formMessagesColor: '$green',

  /**
   * Border color of the form-level message container.
   */
  formMessagesBorderColor: '$green',

  /**
   * Border style of the form-level message container.
   */
  formMessagesBorderStyle: 'solid',

  /**
   * Border width of the form-level message container.
   */
  formMessagesBorderWidth: '1px',

  /**
   * Border radius of the form-level message container.
   */
  formMessagesRadius: '$radius',

  // ======== Elements ========

  /**
   * Horizontal gap between form elements.
   */
  elementsGutterX: '$gutter',

  /**
   * Vertical gap between form elements.
   */
  elementsGutterY: '$gutter',

  /**
   * Horizontal gap between form elements in a stacked layout.
   */
  elementsGutterStackedX: 'calc($gutter * 0.66)',

  /**
   * Vertical gap between form elements in a stacked layout.
   */
  elementsGutterStackedY: 'calc($gutter * 0.66)',

  /**
   * Horizontal gap between elements within a collapsed group.
   */
  elementGroupGutterX: '0',

  /**
   * Vertical gap between elements within a collapsed group.
   */
  elementGroupGutterY: '0.25rem',

  /**
   * Padding around the element wrapper.
   */
  elementWrapperPadding: '0',
}

export const languages = {
  // ======== Typography ========

  /**
   * Font size of language tabs.
   */
  languagesFontSize: '1rem',

  // ======== Spacing ========

  /**
   * Gap between the language tabs and the form content.
   */
  languagesGutter: '$gutter',

  /**
   * Margin around the language tabs container.
   */
  languagesMargin: '0 0 $gutter 0',

  /**
   * Padding inside each language tab.
   */
  languagePadding: '0 1rem 0.5rem 1rem',

  // ======== Background ========

  /**
   * Background color of language tabs.
   */
  languageBg: 'transparent',

  /**
   * Background color of the selected language tab.
   */
  languageBgSelected: 'transparent',

  /**
   * Background color of language tabs in an error state.
   */
  languageBgDanger: 'transparent',

  /**
   * Background color of the selected language tab in an error state.
   */
  languageBgSelectedDanger: 'transparent',

  // ======== Color ========

  /**
   * Text color of language tabs.
   */
  languageColor: 'inherit',

  /**
   * Text color of the selected language tab.
   */
  languageColorSelected: 'inherit',

  /**
   * Text color of language tabs in an error state.
   */
  languageColorDanger: '$red',

  /**
   * Text color of the selected language tab in an error state.
   */
  languageColorSelectedDanger: '$red',

  // ======== Border ========

  /**
   * Border color of language tabs.
   */
  languageBorderColor: 'transparent',

  /**
   * Border color of the selected language tab.
   */
  languageBorderColorSelected: '$brand',

  /**
   * Border color of language tabs in an error state.
   */
  languageBorderColorDanger: 'transparent',

  /**
   * Border color of the selected language tab in an error state.
   */
  languageBorderColorSelectedDanger: '$red',

  /**
   * Border width of language tabs.
   */
  languageBorderWidth: '0 0 2px 0',

  /**
   * Border radius of language tabs.
   */
  languageRadius: '0px',
}

export const tabs = {
  // ======== Typography ========

  /**
   * Font size of tabs.
   */
  tabsFontSize: '1rem',

  // ======== Spacing ========

  /**
   * Horizontal gap between tab items.
   */
  tabsGutterX: '0',

  /**
   * Vertical gap between tab items.
   */
  tabsGutterY: '0',

  /**
   * Margin around the tabs container.
   */
  tabsMargin: '0 0 $gutter 0',

  /**
   * Padding inside each tab item.
   */
  tabPadding: '0 1rem 0.5rem 1rem',

  // ======== Background ========

  /**
   * Background color of tab items.
   */
  tabBg: 'transparent',

  /**
   * Background color of the selected tab.
   */
  tabBgSelected: 'transparent',

  /**
   * Background color of tab items in an error state.
   */
  tabBgDanger: 'transparent',

  /**
   * Background color of the selected tab in an error state.
   */
  tabBgSelectedDanger: 'transparent',

  // ======== Color ========

  /**
   * Text color of tab items.
   */
  tabColor: 'inherit',

  /**
   * Text color of the selected tab.
   */
  tabColorSelected: 'inherit',

  /**
   * Text color of tab items in an error state.
   */
  tabColorDanger: '$red',

  /**
   * Text color of the selected tab in an error state.
   */
  tabColorSelectedDanger: '$red',

  // ======== Border ========

  /**
   * Border color of tab items.
   */
  tabBorderColor: 'transparent',

  /**
   * Border color of the selected tab.
   */
  tabBorderColorSelected: '$brand',

  /**
   * Border color of tab items in an error state.
   */
  tabBorderColorDanger: 'transparent',

  /**
   * Border color of the selected tab in an error state.
   */
  tabBorderColorSelectedDanger: '$red',

  /**
   * Border width of tab items.
   */
  tabBorderWidth: '0 0 2px 0',

  /**
   * Border radius of tab items.
   */
  tabRadius: '0px',
}

export const steps = {
  // ======== Typography ========

  /**
   * Font size of steps.
   */
  stepsFontSize: '1rem',

  // ======== Spacing ========

  /**
   * Margin around the steps container.
   */
  stepsMargin: '0 0 $gutter 0',

  // ======== Background ========

  /**
   * Background color of the progress bar for enabled (completed) steps.
   */
  stepsBgEnabled: '$brand',

  /**
   * Background color of the progress bar for disabled (future) steps.
   */
  stepsBgDisabled: '$gray200',

  /**
   * Background color of the progress bar for steps with errors.
   */
  stepsBgDanger: '$red',

  // ======== Color ========

  /**
   * Text color of enabled step labels.
   */
  stepsColorEnabled: 'inherit',

  /**
   * Text color of disabled step labels.
   */
  stepsColorDisabled: '$gray400',

  /**
   * Text color of step labels with errors.
   */
  stepsColorDanger: '$red',

  /**
   * Text color of the currently selected step label.
   */
  stepsColorSelected: 'inherit',

  /**
   * Icon color inside step indicator dots.
   */
  stepsIconColor: '$white',

  // ======== Icons ========

  /**
   * SVG icon for the currently selected step indicator.
   */
  stepsIconSelected:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><circle cx='4' cy='4' r='4' fill='white'/></svg>\")",

  /**
   * SVG icon for a completed step indicator.
   */
  stepsIconCompleted:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' d='M2 8l4 5 8-10'/></svg>\")",

  /**
   * SVG icon for a step indicator in an error state.
   */
  stepsIconDanger:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect x='6' y='0' width='4' height='9' rx='2' fill='white'/><circle cx='8' cy='13' r='2' fill='white'/></svg>\")",
}

export const nav = {
  // ======== Spacing ========

  /**
   * Gap between navigation buttons.
   */
  navGutter: '$gutter',

  /**
   * Margin around the navigation bar.
   */
  navMargin: '$gutter 0 0 0',

  /**
   * Justify-content value for the navigation bar layout.
   */
  navJustify: 'space-between',
}

export const blockquote = {
  // ======== Spacing ========

  /**
   * Padding inside the blockquote element.
   */
  blockquotePadding: '0.25rem 0.75rem',
}

export const hr = {
  // ======== Spacing ========

  /**
   * Padding around the horizontal rule element.
   */
  hrPadding: '0.25rem 0',
}

// ============================================================================
// Dark Overrides
// ----------------------------------------------------------------------------
// Theme tokens that override their base values in dark mode.
// ============================================================================
export const dark = {
  // ======== Primitives ========

  gray50: '#efefef',
  gray100: '#dcdcdc',
  gray200: '#bdbdbd',
  gray300: '#a0a0a0',
  gray400: '#848484',
  gray500: '#737373',
  gray600: '#393939',
  gray700: '#323232',
  gray800: '#262626',
  gray900: '#191919',

  // ======== Semantic ========

  textSoft: '$gray300',

  // ======== Secondary ========

  btnBgSecondary: '$gray600',
  btnColorSecondary: '$gray100',
  btnBorderColorSecondary: '$gray600',
  btnOutlineSecondary: '$gray300',

  btnBgSecondaryHover: '$gray700',
  btnColorSecondaryHover: '$white',
  btnBorderColorSecondaryHover: '$gray700',
  btnOutlineSecondaryHover: '$gray300',

  btnRingColorSecondary: '$gray600',
  btnRingShadowSecondary: 'none',

  // ======== Contrast ========

  btnBgContrast: '$white',
  btnColorContrast: '$gray900',
  btnBorderColorContrast: '$white',
  btnOutlineContrast: '$white',

  btnBgContrastHover: '$gray100',
  btnColorContrastHover: '$gray900',
  btnBorderColorContrastHover: '$gray100',
  btnOutlineContrastHover: '$white',

  btnRingColorContrast: '$white',
  btnRingShadowContrast: 'none',

  // ======== Disabled ========
  bgDisabled: '$gray700',
  textDisabled: '$gray500',
  borderDisabled: '$gray600',

  // ======== Layout ========
  elementLineColor: '$gray700',

  // ======== Input ========
  inputBg: '$gray900',
  inputBgAutofill: '$gray900',
  inputBgDanger: '$gray900',
  inputBgDisabled: '$bgDisabled',

  inputColor: '$white',
  inputColorAutofill: '$white',
  inputColorDanger: '$white',
  inputColorDisabled: '$textDisabled',

  inputBorderColor: '$gray600',
  inputBorderColorDanger: '$gray600',
  inputBorderColorDisabled: '$borderDisabled',

  // ======== Select ========
  selectIconCaret:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 12' fill='none' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 4.5L5 1l4 3.5'/%3E%3Cpath d='M1 7.5L5 11l4-3.5'/%3E%3C/svg%3E\")",

  // ======== Choice ========
  choiceBg: '$gray900',
  choiceBgDanger: '$gray900',
  choiceBgCheckedDisabled: '$gray500',

  choiceBorderColor: '$gray600',
  choiceBorderColorDanger: '$gray600',
  choiceBorderColorCheckedDisabled: '$gray500',

  // ======== Button ========
  btnBg: '$gray600',
  btnBgHover: '$gray700',
  btnBgLight: '$gray700',
  btnBgDisabled: '$gray700',

  btnColor: '$white',
  btnColorHover: '$white',
  btnColorDisabled: '$gray400',
  btnColorOutline: '$gray300',

  btnBorderColor: '$gray600',
  btnBorderColorHover: '$gray700',
  btnBorderColorDisabled: '$gray700',
  btnBorderColorOutline: '$gray700',
  btnBorderColorOutlineDisabled: '$gray600',

  // ======== Addon ========
  addonBg: '$gray900',
  addonBgDanger: '$gray900',
  addonBorderColor: '$gray700',
  addonBorderColorDanger: '$gray700',

  // ======== Group ========
  groupWrappedBorderColor: '$gray600',

  // ======== List ========
  listWrappedBorderColor: '$gray600',

  // ======== Steps ========
  stepsBgDisabled: '$gray600',

  // ======== Controls ========
  controlBg: '$gray600',
  controlBgHover: '$gray500',
  controlColor: '$white',
  controlColorHover: '$white',
  controlBorderColor: '$gray700',
  controlBorderColorHover: '$gray600',

  // ======== Tabular ========
  tabularBg: '$gray900',
  tabularColor: '$white',
  tabularBorderColor: '$gray700',

  tabularColHeaderBg: '$gray800',
  tabularColHeaderBorderColor: '$gray700',

  tabularRowHeaderBg: '$gray800',
  tabularRowHeaderBorderColor: '$gray700',

  // ======== Elements ========
  elementLineBorderColor: '$gray600',
}
