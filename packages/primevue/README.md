# Vueform PrimeVue

PrimeVue adapter for Vueform.

## Bundle Size

<!--@size-start-->

Generated at 2026-10-06T10:22:21.416Z. Sizes are the emitted JS and CSS assets of a production Vite build with default settings (esbuild minification for JS and CSS, no custom config), measured as deltas against a baseline (Vite app only, no Vueform, no PrimeVue).

All numbers show only what Vueform adds **on top of PrimeVue** — matched builds importing the same raw `primevue/*` modules without Vueform are subtracted.

Measured with:

- Node v24.21.0
- `pnpm@10.20.0`
- `vue@3.5.43`
- `vite@8.3.2`
- `@vueform/core@2.0.0-alpha.1`
- `@vueform/primevue@2.0.0-alpha.1`
- `primevue@4.5.5`
- `@primeuix/themes@2.0.3`
- `primeicons@7.0.0`

## How to interpret results

In tables with a **Total** row, the individual rows show the size that removing that item saves from the bundle, while the **Total** row is measured with all items added — it also contains code shared between items, so it can exceed the sum of the individual rows.

## Core

The size of the bare `createVueform` import — the smallest possible Vueform footprint. Modules, components, rules, locales and themes extend this size; for their numbers see the tables below.

|  | JS |
| --- | --- |
| Gzip | 6.19&nbsp;kB |
| Brotli | 5.42&nbsp;kB |
| Raw | 16.39&nbsp;kB |

## Modules

What each module adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Module | JS |
| --- | --- |
| `devtools` | 20.34&nbsp;kB |
| `model` | 7.50&nbsp;kB |
| `validation` | 5.99&nbsp;kB |
| `theme` | 2.06&nbsp;kB |
| `conditions` | 2.01&nbsp;kB |
| `autosave` | 1.99&nbsp;kB |
| `security` | 1.60&nbsp;kB |
| `expression` | 1.25&nbsp;kB |
| `http` | 0.97&nbsp;kB |
| `router` | 0.59&nbsp;kB |
| `locale` | 0.28&nbsp;kB |
| `date` | 0.14&nbsp;kB |
| **Total** | 44.02&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Module | JS |
| --- | --- |
| `devtools` | 16.29&nbsp;kB |
| `model` | 6.94&nbsp;kB |
| `validation` | 5.37&nbsp;kB |
| `theme` | 1.71&nbsp;kB |
| `conditions` | 1.79&nbsp;kB |
| `autosave` | 1.73&nbsp;kB |
| `security` | 1.39&nbsp;kB |
| `expression` | 1.08&nbsp;kB |
| `http` | 0.88&nbsp;kB |
| `router` | 0.46&nbsp;kB |
| `locale` | 0.17&nbsp;kB |
| `date` | 0.04&nbsp;kB |
| **Total** | 37.30&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Module | JS |
| --- | --- |
| `devtools` | 58.47&nbsp;kB |
| `model` | 23.77&nbsp;kB |
| `validation` | 19.13&nbsp;kB |
| `theme` | 5.85&nbsp;kB |
| `conditions` | 6.68&nbsp;kB |
| `autosave` | 5.53&nbsp;kB |
| `security` | 4.31&nbsp;kB |
| `expression` | 3.58&nbsp;kB |
| `http` | 2.72&nbsp;kB |
| `router` | 1.58&nbsp;kB |
| `locale` | 0.90&nbsp;kB |
| `date` | 0.37&nbsp;kB |
| **Total** | 130.47&nbsp;kB |

</details>

## Components

What each component adds to the bundle when registered, split into **JS** and **CSS** — a component imports exactly the theme chunks it needs, so its stylesheet cost is part of it.

Values near zero — even slightly negative, within ±0.2 kB — are compression noise: removing the item can make the compression slightly more effective, and that improvement can exceed the few bytes the item itself adds.

<details open>
<summary><h3>Gzip</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 7.60&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 4.81&nbsp;kB | 1.08&nbsp;kB |
| `VfLayout` | 3.52&nbsp;kB | 0.71&nbsp;kB |
| `VfList` | 2.15&nbsp;kB | 0.17&nbsp;kB |
| `VfEditor` | 1.95&nbsp;kB | 0.37&nbsp;kB |
| `VfGrid` | 2.27&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 2.07&nbsp;kB | 0.05&nbsp;kB |
| `VfListbox` | 2.09&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 1.87&nbsp;kB | 0.00&nbsp;kB |
| `VfInputNumber` | 1.59&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 1.55&nbsp;kB | 0.02&nbsp;kB |
| `VfNav` | 1.34&nbsp;kB | 0.12&nbsp;kB |
| `VfDatePicker` | 1.42&nbsp;kB | 0.00&nbsp;kB |
| `VfCascadeSelect` | 1.20&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButton` | 1.17&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 1.11&nbsp;kB | 0.02&nbsp;kB |
| `VfAddon` | 0.53&nbsp;kB | 0.56&nbsp;kB |
| `VfPassword` | 1.08&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 0.83&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 0.84&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.81&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButtonGroup` | 0.73&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | 0.70&nbsp;kB | -0.01&nbsp;kB |
| `VfMultiSelect` | 0.68&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | 0.58&nbsp;kB | 0.01&nbsp;kB |
| `VfInputMask` | 0.58&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 0.44&nbsp;kB | 0.07&nbsp;kB |
| `VfSelect` | 0.44&nbsp;kB | 0.00&nbsp;kB |
| `VfSlider` | 0.39&nbsp;kB | 0.04&nbsp;kB |
| `VfToggleSwitch` | 0.39&nbsp;kB | 0.03&nbsp;kB |
| `VfInputText` | 0.40&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.36&nbsp;kB | 0.04&nbsp;kB |
| `VfField` | 0.39&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.24&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.22&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.13&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 0.12&nbsp;kB | 0.00&nbsp;kB |
| `VfSelectButton` | -0.02&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | -0.06&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | -0.17&nbsp;kB | 0.04&nbsp;kB |
| **Total** | 73.98&nbsp;kB | 5.52&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 5.69&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 2.81&nbsp;kB | 0.90&nbsp;kB |
| `VfLayout` | 3.04&nbsp;kB | 0.59&nbsp;kB |
| `VfList` | 1.12&nbsp;kB | 0.12&nbsp;kB |
| `VfEditor` | 1.32&nbsp;kB | 0.33&nbsp;kB |
| `VfGrid` | 1.51&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 0.64&nbsp;kB | 0.04&nbsp;kB |
| `VfListbox` | 0.21&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 0.41&nbsp;kB | 0.00&nbsp;kB |
| `VfInputNumber` | 0.32&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 0.24&nbsp;kB | 0.01&nbsp;kB |
| `VfNav` | 0.98&nbsp;kB | 0.11&nbsp;kB |
| `VfDatePicker` | 0.70&nbsp;kB | 0.00&nbsp;kB |
| `VfCascadeSelect` | 0.02&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButton` | 0.22&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.61&nbsp;kB | 0.03&nbsp;kB |
| `VfAddon` | 0.07&nbsp;kB | 0.47&nbsp;kB |
| `VfPassword` | 0.06&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 0.51&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 0.26&nbsp;kB | -0.03&nbsp;kB |
| `VfCol` | 0.62&nbsp;kB | -0.02&nbsp;kB |
| `VfRadioButtonGroup` | 0.11&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | -0.06&nbsp;kB | 0.00&nbsp;kB |
| `VfMultiSelect` | 0.21&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | 0.10&nbsp;kB | -0.01&nbsp;kB |
| `VfInputMask` | 0.25&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 0.16&nbsp;kB | 0.05&nbsp;kB |
| `VfSelect` | -0.11&nbsp;kB | 0.00&nbsp;kB |
| `VfSlider` | 0.24&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleSwitch` | 0.18&nbsp;kB | 0.03&nbsp;kB |
| `VfInputText` | 0.15&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.26&nbsp;kB | 0.03&nbsp;kB |
| `VfField` | 0.36&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | 0.38&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.14&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.11&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | -0.17&nbsp;kB | 0.02&nbsp;kB |
| `VfTextarea` | 0.00&nbsp;kB | 0.00&nbsp;kB |
| `VfSelectButton` | -0.04&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | 0.18&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | -0.07&nbsp;kB | 0.04&nbsp;kB |
| **Total** | 45.10&nbsp;kB | 4.83&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 23.31&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 17.41&nbsp;kB | 17.29&nbsp;kB |
| `VfLayout` | 15.38&nbsp;kB | 4.08&nbsp;kB |
| `VfList` | 7.95&nbsp;kB | 1.38&nbsp;kB |
| `VfEditor` | 7.76&nbsp;kB | 1.95&nbsp;kB |
| `VfGrid` | 7.75&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 4.75&nbsp;kB | 0.23&nbsp;kB |
| `VfListbox` | 3.54&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 5.82&nbsp;kB | 0.00&nbsp;kB |
| `VfInputNumber` | 4.12&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 4.15&nbsp;kB | 0.09&nbsp;kB |
| `VfNav` | 5.22&nbsp;kB | 0.49&nbsp;kB |
| `VfDatePicker` | 5.34&nbsp;kB | 0.00&nbsp;kB |
| `VfCascadeSelect` | 4.06&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButton` | 5.00&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 4.13&nbsp;kB | 0.16&nbsp;kB |
| `VfAddon` | 1.42&nbsp;kB | 4.91&nbsp;kB |
| `VfPassword` | 3.67&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 4.97&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 4.97&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 2.58&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButtonGroup` | 5.09&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | 5.18&nbsp;kB | 0.00&nbsp;kB |
| `VfMultiSelect` | 4.19&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | 2.80&nbsp;kB | 0.07&nbsp;kB |
| `VfInputMask` | 3.67&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 3.25&nbsp;kB | 0.97&nbsp;kB |
| `VfSelect` | 4.11&nbsp;kB | 0.00&nbsp;kB |
| `VfSlider` | 2.74&nbsp;kB | 0.19&nbsp;kB |
| `VfToggleSwitch` | 3.55&nbsp;kB | 0.16&nbsp;kB |
| `VfInputText` | 3.71&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 2.09&nbsp;kB | 0.23&nbsp;kB |
| `VfField` | 3.06&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | 3.19&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 1.14&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 1.59&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.74&nbsp;kB | 0.02&nbsp;kB |
| `VfTextarea` | 3.56&nbsp;kB | 0.00&nbsp;kB |
| `VfSelectButton` | 3.27&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | 3.01&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | 2.78&nbsp;kB | 0.22&nbsp;kB |
| **Total** | 260.33&nbsp;kB | 48.14&nbsp;kB |

</details>

## Rules

What each rule adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.60&nbsp;kB |
| `ip` | 0.46&nbsp;kB |
| `url` | 0.45&nbsp;kB |
| `not_regex` | 0.44&nbsp;kB |
| `before_or_equal` | 0.42&nbsp;kB |
| `after_or_equal` | 0.42&nbsp;kB |
| `regex` | 0.41&nbsp;kB |
| `before` | 0.41&nbsp;kB |
| `after` | 0.41&nbsp;kB |
| `ipv6` | 0.40&nbsp;kB |
| `email` | 0.29&nbsp;kB |
| `gte` | 0.29&nbsp;kB |
| `image` | 0.29&nbsp;kB |
| `lte` | 0.29&nbsp;kB |
| `gt` | 0.28&nbsp;kB |
| `lt` | 0.28&nbsp;kB |
| `mimes` | 0.27&nbsp;kB |
| `mimetypes` | 0.26&nbsp;kB |
| `date_format` | 0.25&nbsp;kB |
| `ipv4` | 0.25&nbsp;kB |
| `different` | 0.25&nbsp;kB |
| `same` | 0.24&nbsp;kB |
| `in_array` | 0.24&nbsp;kB |
| `date` | 0.23&nbsp;kB |
| `file` | 0.23&nbsp;kB |
| `between` | 0.22&nbsp;kB |
| `numeric` | 0.22&nbsp;kB |
| `digits_between` | 0.22&nbsp;kB |
| `distinct` | 0.21&nbsp;kB |
| `timezone` | 0.21&nbsp;kB |
| `max` | 0.21&nbsp;kB |
| `min` | 0.21&nbsp;kB |
| `size` | 0.20&nbsp;kB |
| `digits` | 0.20&nbsp;kB |
| `alpha_dash` | 0.20&nbsp;kB |
| `uuid` | 0.20&nbsp;kB |
| `confirmed` | 0.20&nbsp;kB |
| `in` | 0.20&nbsp;kB |
| `accepted` | 0.20&nbsp;kB |
| `json` | 0.20&nbsp;kB |
| `alpha_num` | 0.19&nbsp;kB |
| `captcha` | 0.19&nbsp;kB |
| `integer` | 0.19&nbsp;kB |
| `date_equals` | 0.19&nbsp;kB |
| `boolean` | 0.19&nbsp;kB |
| `alpha` | 0.19&nbsp;kB |
| `not_in` | 0.19&nbsp;kB |
| `required` | 0.18&nbsp;kB |
| `filled` | 0.18&nbsp;kB |
| `array` | 0.17&nbsp;kB |
| `nullable` | 0.17&nbsp;kB |
| `string` | 0.17&nbsp;kB |
| **Total** | 3.19&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.46&nbsp;kB |
| `ip` | 0.39&nbsp;kB |
| `url` | 0.33&nbsp;kB |
| `not_regex` | 0.41&nbsp;kB |
| `before_or_equal` | 0.37&nbsp;kB |
| `after_or_equal` | 0.34&nbsp;kB |
| `regex` | 0.31&nbsp;kB |
| `before` | 0.37&nbsp;kB |
| `after` | 0.33&nbsp;kB |
| `ipv6` | 0.30&nbsp;kB |
| `email` | 0.23&nbsp;kB |
| `gte` | 0.23&nbsp;kB |
| `image` | 0.21&nbsp;kB |
| `lte` | 0.22&nbsp;kB |
| `gt` | 0.18&nbsp;kB |
| `lt` | 0.19&nbsp;kB |
| `mimes` | 0.15&nbsp;kB |
| `mimetypes` | 0.21&nbsp;kB |
| `date_format` | 0.26&nbsp;kB |
| `ipv4` | 0.21&nbsp;kB |
| `different` | 0.20&nbsp;kB |
| `same` | 0.23&nbsp;kB |
| `in_array` | 0.15&nbsp;kB |
| `date` | 0.19&nbsp;kB |
| `file` | 0.19&nbsp;kB |
| `between` | 0.15&nbsp;kB |
| `numeric` | 0.16&nbsp;kB |
| `digits_between` | 0.20&nbsp;kB |
| `distinct` | 0.11&nbsp;kB |
| `timezone` | 0.15&nbsp;kB |
| `max` | 0.14&nbsp;kB |
| `min` | 0.22&nbsp;kB |
| `size` | 0.14&nbsp;kB |
| `digits` | 0.14&nbsp;kB |
| `alpha_dash` | 0.14&nbsp;kB |
| `uuid` | 0.19&nbsp;kB |
| `confirmed` | 0.18&nbsp;kB |
| `in` | 0.16&nbsp;kB |
| `accepted` | 0.17&nbsp;kB |
| `json` | 0.11&nbsp;kB |
| `alpha_num` | 0.15&nbsp;kB |
| `captcha` | 0.15&nbsp;kB |
| `integer` | 0.14&nbsp;kB |
| `date_equals` | 0.11&nbsp;kB |
| `boolean` | 0.15&nbsp;kB |
| `alpha` | 0.19&nbsp;kB |
| `not_in` | 0.21&nbsp;kB |
| `required` | 0.18&nbsp;kB |
| `filled` | 0.17&nbsp;kB |
| `array` | 0.09&nbsp;kB |
| `nullable` | 0.17&nbsp;kB |
| `string` | 0.13&nbsp;kB |
| **Total** | 2.83&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 1.83&nbsp;kB |
| `ip` | 1.90&nbsp;kB |
| `url` | 1.08&nbsp;kB |
| `not_regex` | 1.22&nbsp;kB |
| `before_or_equal` | 1.39&nbsp;kB |
| `after_or_equal` | 1.39&nbsp;kB |
| `regex` | 1.09&nbsp;kB |
| `before` | 1.37&nbsp;kB |
| `after` | 1.36&nbsp;kB |
| `ipv6` | 1.71&nbsp;kB |
| `email` | 0.79&nbsp;kB |
| `gte` | 0.88&nbsp;kB |
| `image` | 0.85&nbsp;kB |
| `lte` | 0.88&nbsp;kB |
| `gt` | 0.88&nbsp;kB |
| `lt` | 0.88&nbsp;kB |
| `mimes` | 0.85&nbsp;kB |
| `mimetypes` | 0.84&nbsp;kB |
| `date_format` | 0.86&nbsp;kB |
| `ipv4` | 0.71&nbsp;kB |
| `different` | 0.75&nbsp;kB |
| `same` | 0.75&nbsp;kB |
| `in_array` | 0.74&nbsp;kB |
| `date` | 0.80&nbsp;kB |
| `file` | 0.76&nbsp;kB |
| `between` | 0.70&nbsp;kB |
| `numeric` | 0.67&nbsp;kB |
| `digits_between` | 0.71&nbsp;kB |
| `distinct` | 0.70&nbsp;kB |
| `timezone` | 0.65&nbsp;kB |
| `max` | 0.67&nbsp;kB |
| `min` | 0.67&nbsp;kB |
| `size` | 0.67&nbsp;kB |
| `digits` | 0.66&nbsp;kB |
| `alpha_dash` | 0.61&nbsp;kB |
| `uuid` | 0.64&nbsp;kB |
| `confirmed` | 0.63&nbsp;kB |
| `in` | 0.64&nbsp;kB |
| `accepted` | 0.62&nbsp;kB |
| `json` | 0.64&nbsp;kB |
| `alpha_num` | 0.61&nbsp;kB |
| `captcha` | 0.62&nbsp;kB |
| `integer` | 0.63&nbsp;kB |
| `date_equals` | 0.63&nbsp;kB |
| `boolean` | 0.61&nbsp;kB |
| `alpha` | 0.60&nbsp;kB |
| `not_in` | 0.62&nbsp;kB |
| `required` | 0.60&nbsp;kB |
| `filled` | 0.60&nbsp;kB |
| `array` | 0.59&nbsp;kB |
| `nullable` | 0.59&nbsp;kB |
| `string` | 0.60&nbsp;kB |
| **Total** | 10.98&nbsp;kB |

</details>

## Locales

What each locale adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.71&nbsp;kB |
| `de_DE` | 1.56&nbsp;kB |
| `en_US` | 1.27&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.50&nbsp;kB |
| `de_DE` | 1.36&nbsp;kB |
| `en_US` | 1.07&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 7.39&nbsp;kB |
| `de_DE` | 6.61&nbsp;kB |
| `en_US` | 6.45&nbsp;kB |

</details>

## Themes

What a theme's token definitions add to the bundle.

<details open>
<summary><h3>Gzip</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 1.97&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 1.58&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 7.54&nbsp;kB |

</details>

<!--@size-end-->