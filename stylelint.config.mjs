/**
 * @type {import('stylelint').Config}
 */
export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  rules: {
    'declaration-block-no-duplicate-custom-properties': true,
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'scss/no-global-function-names': null,
    'scss/operator-no-newline-after': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'shorthand-property-no-redundant-values': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'selector-pseudo-element-colon-notation': null,
    'property-no-deprecated': null,
    'property-no-vendor-prefix': null,
    'color-hex-length': null,
    'length-zero-no-unit': null,
    'at-rule-empty-line-before': null,
    'scss/load-partial-extension': null,
  },
  ignoreFiles: ['**/dist/**', '.vueform/**', '.playgrounds/**'],
}
