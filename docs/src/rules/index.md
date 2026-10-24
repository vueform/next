# Rules

All built-in validation rules are registered automatically and referenced by name in the [rule language](/guide/validation#the-rule-language). To include only the ones you use, see [Code-Splitting](/guide/code-splitting#rules). Each rule has its own page with usage examples, parameters, behavior, and error messages.

## Presence

Presence rules decide whether a value must exist at all — the gate the other rules run behind.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`required`](/rules/required) | — | Element must have a non-empty value. |
| [`accepted`](/rules/accepted) | — | Value must be `'yes'`, `'on'`, `'1'`, `1`, `true`, or `'true'`. |
| [`filled`](/rules/filled) | — | If present, value must not be empty. |
| [`nullable`](/rules/nullable) | — | Allows the value to be empty — skips all other rules when it is. |

## String Format

Format rules validate that a string follows a well-known shape.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`email`](/rules/email) | — | Must be a valid email address. |
| [`url`](/rules/url) | — | Must be a valid URL (http/https/ftp). |
| [`ip`](/rules/ip) | — | Must be a valid IPv4 or IPv6 address. |
| [`ipv4`](/rules/ipv4) | — | Must be a valid IPv4 address. |
| [`ipv6`](/rules/ipv6) | — | Must be a valid IPv6 address. |
| [`alpha`](/rules/alpha) | — | May only contain Unicode letters. |
| [`alpha_num`](/rules/alpha_num) | — | May only contain Unicode letters and digits. |
| [`alpha_dash`](/rules/alpha_dash) | — | May only contain Unicode letters, digits, dashes, and underscores. |
| [`uuid`](/rules/uuid) | — | Must be a valid UUID. |
| [`json`](/rules/json) | — | Must be a valid JSON string. |
| [`timezone`](/rules/timezone) | — | Must be a valid IANA timezone (e.g. `America/New_York`). |

## Type

Type rules validate the value's data type.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`string`](/rules/string) | — | Must be a string. |
| [`numeric`](/rules/numeric) | — | Must be a numeric value. |
| [`integer`](/rules/integer) | — | Must be an integer. |
| [`boolean`](/rules/boolean) | — | Must be boolean-like (`true`, `false`, `0`, `1`, `'0'`, `'1'`). |
| [`array`](/rules/array) | — | Must be an array. |
| [`date`](/rules/date) | — | Must be a valid date (requires the [date](/guide/date) module). |

## Size

Size rules behave differently depending on the element type:

- **String**: size is the character count
- **Numeric**: size is the numeric value itself
- **Array**: size is the number of items
- **File**: size is in kilobytes

| Rule | Parameters | Description |
| --- | --- | --- |
| [`min`](/rules/min) | `min` | Size must be at least `min`. |
| [`max`](/rules/max) | `max` | Size must not exceed `max`. |
| [`between`](/rules/between) | `min,max` | Size must be between `min` and `max` (inclusive). |
| [`size`](/rules/size) | `size` | Size must be exactly `size`. |
| [`digits`](/rules/digits) | `digits` | Must be numeric and have exactly `digits` digits. |
| [`digits_between`](/rules/digits_between) | `min,max` | Must be numeric with digit count between `min` and `max`. |

## Comparison

These rules compare the element's size against another element's size. The other element is referenced by its path — see [referencing other elements](/guide/validation#referencing-other-elements).

| Rule | Parameters | Description |
| --- | --- | --- |
| [`gt`](/rules/gt) | `other` | Size must be greater than `other` element's size. |
| [`gte`](/rules/gte) | `other` | Size must be greater than or equal to `other` element's size. |
| [`lt`](/rules/lt) | `other` | Size must be less than `other` element's size. |
| [`lte`](/rules/lte) | `other` | Size must be less than or equal to `other` element's size. |

## Cross-field

Cross-field rules validate a value against another element's value.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`same`](/rules/same) | `other` | Must have the same value as the `other` element. |
| [`different`](/rules/different) | `other` | Must have a different value from the `other` element. |
| [`confirmed`](/rules/confirmed) | — | Expects a sibling element named `{name}_confirmed` with a matching value. |
| [`in_array`](/rules/in_array) | `other` | Value must exist in the `other` element's array value. |

## Membership

Membership rules check the value against a fixed list of allowed or forbidden values.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`in`](/rules/in) | `value1,value2,...` | Value must be one of the listed values. |
| [`not_in`](/rules/not_in) | `value1,value2,...` | Value must not be any of the listed values. |

## Pattern

Pattern rules match the value against a regular expression.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`regex`](/rules/regex) | `/pattern/flags` | Value must match the regular expression. |
| [`not_regex`](/rules/not_regex) | `/pattern/flags` | Value must not match the regular expression. |

## Date

Date rules require the [date](/guide/date) module to be installed. The date parameter can be a date string, the keywords `today`, `tomorrow`, `yesterday`, or another element's path.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`date_format`](/rules/date_format) | `format` | Must match the given date format. |
| [`date_equals`](/rules/date_equals) | `date` | Must equal the given date. |
| [`after`](/rules/after) | `date` | Must be after the given date or element. |
| [`after_or_equal`](/rules/after_or_equal) | `date` | Must be after or equal to the given date or element. |
| [`before`](/rules/before) | `date` | Must be before the given date or element. |
| [`before_or_equal`](/rules/before_or_equal) | `date` | Must be before or equal to the given date or element. |

## File

File rules validate uploaded files — their type, extension, and image dimensions.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`file`](/rules/file) | — | Must be a file. |
| [`image`](/rules/image) | — | Must be an image (jpg, jpeg, png, gif, bmp, svg, webp). |
| [`mimes`](/rules/mimes) | `ext1,ext2,...` | File extension must be one of the listed types. |
| [`mimetypes`](/rules/mimetypes) | `type1,type2,...` | File MIME type must be one of the listed types. |
| [`dimensions`](/rules/dimensions) | named params | Image dimensions must match the constraints (see below). |

The `dimensions` rule uses [named parameters](/guide/validation#parameters): `width`, `height`, `min_width`, `min_height`, `max_width`, `max_height`, and `ratio`.

## Array

Array rules validate the items of array values.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`distinct`](/rules/distinct) | — | All items in the array must be unique. |

## Other

Rules tied to specific elements rather than general values.

| Rule | Parameters | Description |
| --- | --- | --- |
| [`captcha`](/rules/captcha) | — | Captcha must be verified (async — provided by captcha elements). |
