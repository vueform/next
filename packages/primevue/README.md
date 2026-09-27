# Vueform PrimeVue

PrimeVue adapter for Vueform.

## Bundle Size

<!--@size-start-->

Generated at 2026-09-27T06:10:40.681Z. Sizes are the emitted JS and CSS assets of a production Vite build with default settings (esbuild minification for JS and CSS, no custom config), measured as deltas against a baseline (Vite app only, no Vueform, no PrimeVue).

All numbers show only what Vueform adds **on top of PrimeVue** — matched builds importing the same raw `primevue/*` modules without Vueform are subtracted.

Measured with:

- Node v26.8.2
- `pnpm@10.20.0`
- `vue@3.5.43`
- `vite@7.3.6`
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
| Gzip | 6.57&nbsp;kB |
| Brotli | 5.63&nbsp;kB |
| Raw | 16.68&nbsp;kB |

## Modules

What each module adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 7.78&nbsp;kB |
| `validation` | 6.72&nbsp;kB |
| `conditions` | 2.19&nbsp;kB |
| `theme` | 2.00&nbsp;kB |
| `autosave` | 1.86&nbsp;kB |
| `expression` | 1.25&nbsp;kB |
| `security` | 1.18&nbsp;kB |
| `http` | 1.08&nbsp;kB |
| `router` | 0.61&nbsp;kB |
| `locale` | 0.32&nbsp;kB |
| `date` | 0.17&nbsp;kB |
| `devtools` | 0.07&nbsp;kB |
| **Total** | 24.41&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 7.11&nbsp;kB |
| `validation` | 5.98&nbsp;kB |
| `conditions` | 1.93&nbsp;kB |
| `theme` | 1.73&nbsp;kB |
| `autosave` | 1.66&nbsp;kB |
| `expression` | 1.15&nbsp;kB |
| `security` | 1.02&nbsp;kB |
| `http` | 0.94&nbsp;kB |
| `router` | 0.53&nbsp;kB |
| `locale` | 0.27&nbsp;kB |
| `date` | 0.13&nbsp;kB |
| `devtools` | 0.09&nbsp;kB |
| **Total** | 21.72&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 23.58&nbsp;kB |
| `validation` | 19.97&nbsp;kB |
| `conditions` | 6.81&nbsp;kB |
| `theme` | 5.49&nbsp;kB |
| `autosave` | 5.04&nbsp;kB |
| `expression` | 3.34&nbsp;kB |
| `security` | 3.04&nbsp;kB |
| `http` | 2.79&nbsp;kB |
| `router` | 1.62&nbsp;kB |
| `locale` | 0.91&nbsp;kB |
| `date` | 0.38&nbsp;kB |
| `devtools` | 0.24&nbsp;kB |
| **Total** | 70.41&nbsp;kB |

</details>

## Components

What each component adds to the bundle when registered, split into **JS** and **CSS** — a component imports exactly the theme chunks it needs, so its stylesheet cost is part of it.

Values near zero — even slightly negative, within ±0.2 kB — are compression noise: removing the item can make the compression slightly more effective, and that improvement can exceed the few bytes the item itself adds.

<details open>
<summary><h3>Gzip</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 8.05&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 4.92&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 3.71&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 2.49&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 2.34&nbsp;kB | 0.00&nbsp;kB |
| `VfEditor` | 2.09&nbsp;kB | 0.00&nbsp;kB |
| `VfListbox` | 2.07&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 1.93&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 1.74&nbsp;kB | 0.00&nbsp;kB |
| `VfDatePicker` | 1.63&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 1.61&nbsp;kB | 0.00&nbsp;kB |
| `VfPassword` | 1.55&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 1.54&nbsp;kB | 0.00&nbsp;kB |
| `VfInputNumber` | 1.52&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButton` | 1.40&nbsp;kB | 0.00&nbsp;kB |
| `VfMultiSelect` | 1.16&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 1.01&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | 1.01&nbsp;kB | 0.00&nbsp;kB |
| `VfCascadeSelect` | 0.99&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.88&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButtonGroup` | 0.81&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | 0.75&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.74&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 0.72&nbsp;kB | 0.00&nbsp;kB |
| `VfInputMask` | 0.61&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.61&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.51&nbsp;kB | 0.00&nbsp;kB |
| `VfSlider` | 0.51&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 0.45&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 0.42&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleSwitch` | 0.41&nbsp;kB | 0.00&nbsp;kB |
| `VfInputText` | 0.40&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.36&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.30&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | 0.29&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.15&nbsp;kB | 0.00&nbsp;kB |
| `VfSelectButton` | 0.11&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | 0.02&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | -0.04&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 77.17&nbsp;kB | 0.00&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 6.40&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 3.86&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 3.63&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 2.25&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 1.26&nbsp;kB | 0.00&nbsp;kB |
| `VfEditor` | 1.64&nbsp;kB | 0.00&nbsp;kB |
| `VfListbox` | 0.57&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 0.86&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 1.06&nbsp;kB | 0.00&nbsp;kB |
| `VfDatePicker` | 1.16&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 1.12&nbsp;kB | 0.00&nbsp;kB |
| `VfPassword` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 0.52&nbsp;kB | 0.00&nbsp;kB |
| `VfInputNumber` | 0.76&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButton` | 0.72&nbsp;kB | 0.00&nbsp;kB |
| `VfMultiSelect` | 0.71&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 0.59&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | 0.30&nbsp;kB | 0.00&nbsp;kB |
| `VfCascadeSelect` | 0.13&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.79&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButtonGroup` | 0.43&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | 0.30&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.48&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 0.42&nbsp;kB | 0.00&nbsp;kB |
| `VfInputMask` | 0.23&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.43&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.53&nbsp;kB | 0.00&nbsp;kB |
| `VfSlider` | 0.31&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 0.60&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 0.53&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleSwitch` | 0.42&nbsp;kB | 0.00&nbsp;kB |
| `VfInputText` | 0.45&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.35&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.40&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | -0.17&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 0.27&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.50&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.29&nbsp;kB | 0.00&nbsp;kB |
| `VfSelectButton` | 0.44&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | 0.29&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | 0.52&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 48.67&nbsp;kB | 0.00&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 23.61&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 17.70&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 15.35&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 7.75&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 8.04&nbsp;kB | 0.00&nbsp;kB |
| `VfEditor` | 7.97&nbsp;kB | 0.00&nbsp;kB |
| `VfListbox` | 3.59&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 5.93&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 4.78&nbsp;kB | 0.00&nbsp;kB |
| `VfDatePicker` | 5.46&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 5.25&nbsp;kB | 0.00&nbsp;kB |
| `VfPassword` | 3.70&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 4.23&nbsp;kB | 0.00&nbsp;kB |
| `VfInputNumber` | 4.18&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButton` | 5.04&nbsp;kB | 0.00&nbsp;kB |
| `VfMultiSelect` | 4.24&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 5.01&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | 2.84&nbsp;kB | 0.00&nbsp;kB |
| `VfCascadeSelect` | 4.10&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 4.14&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButtonGroup` | 5.13&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | 5.21&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 2.44&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 5.01&nbsp;kB | 0.00&nbsp;kB |
| `VfInputMask` | 3.70&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 1.43&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 4.15&nbsp;kB | 0.00&nbsp;kB |
| `VfSlider` | 2.77&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 3.28&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 3.07&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleSwitch` | 3.58&nbsp;kB | 0.00&nbsp;kB |
| `VfInputText` | 3.73&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 2.10&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 1.17&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | 3.22&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 3.59&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 1.60&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.75&nbsp;kB | 0.00&nbsp;kB |
| `VfSelectButton` | 3.29&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | 3.05&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | 2.81&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 263.42&nbsp;kB | 0.00&nbsp;kB |

</details>

## Rules

What each rule adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.63&nbsp;kB |
| `ip` | 0.47&nbsp;kB |
| `url` | 0.46&nbsp;kB |
| `before_or_equal` | 0.45&nbsp;kB |
| `after_or_equal` | 0.45&nbsp;kB |
| `before` | 0.44&nbsp;kB |
| `after` | 0.44&nbsp;kB |
| `ipv6` | 0.41&nbsp;kB |
| `not_regex` | 0.37&nbsp;kB |
| `regex` | 0.34&nbsp;kB |
| `gte` | 0.31&nbsp;kB |
| `lte` | 0.31&nbsp;kB |
| `gt` | 0.30&nbsp;kB |
| `lt` | 0.30&nbsp;kB |
| `email` | 0.30&nbsp;kB |
| `image` | 0.30&nbsp;kB |
| `date_format` | 0.27&nbsp;kB |
| `mimes` | 0.26&nbsp;kB |
| `different` | 0.26&nbsp;kB |
| `mimetypes` | 0.26&nbsp;kB |
| `ipv4` | 0.26&nbsp;kB |
| `same` | 0.26&nbsp;kB |
| `in_array` | 0.26&nbsp;kB |
| `between` | 0.25&nbsp;kB |
| `digits_between` | 0.24&nbsp;kB |
| `file` | 0.24&nbsp;kB |
| `date` | 0.24&nbsp;kB |
| `numeric` | 0.24&nbsp;kB |
| `max` | 0.23&nbsp;kB |
| `min` | 0.23&nbsp;kB |
| `distinct` | 0.23&nbsp;kB |
| `size` | 0.23&nbsp;kB |
| `timezone` | 0.22&nbsp;kB |
| `digits` | 0.22&nbsp;kB |
| `confirmed` | 0.21&nbsp;kB |
| `integer` | 0.21&nbsp;kB |
| `date_equals` | 0.21&nbsp;kB |
| `uuid` | 0.21&nbsp;kB |
| `json` | 0.21&nbsp;kB |
| `accepted` | 0.21&nbsp;kB |
| `alpha_dash` | 0.21&nbsp;kB |
| `alpha` | 0.21&nbsp;kB |
| `alpha_num` | 0.21&nbsp;kB |
| `captcha` | 0.21&nbsp;kB |
| `boolean` | 0.20&nbsp;kB |
| `required` | 0.19&nbsp;kB |
| `filled` | 0.19&nbsp;kB |
| `in` | 0.19&nbsp;kB |
| `nullable` | 0.19&nbsp;kB |
| `array` | 0.18&nbsp;kB |
| `string` | 0.18&nbsp;kB |
| `not_in` | 0.18&nbsp;kB |
| **Total** | 3.14&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.53&nbsp;kB |
| `ip` | 0.49&nbsp;kB |
| `url` | 0.37&nbsp;kB |
| `before_or_equal` | 0.42&nbsp;kB |
| `after_or_equal` | 0.44&nbsp;kB |
| `before` | 0.37&nbsp;kB |
| `after` | 0.37&nbsp;kB |
| `ipv6` | 0.33&nbsp;kB |
| `not_regex` | 0.33&nbsp;kB |
| `regex` | 0.26&nbsp;kB |
| `gte` | 0.27&nbsp;kB |
| `lte` | 0.22&nbsp;kB |
| `gt` | 0.28&nbsp;kB |
| `lt` | 0.27&nbsp;kB |
| `email` | 0.33&nbsp;kB |
| `image` | 0.24&nbsp;kB |
| `date_format` | 0.28&nbsp;kB |
| `mimes` | 0.18&nbsp;kB |
| `different` | 0.33&nbsp;kB |
| `mimetypes` | 0.20&nbsp;kB |
| `ipv4` | 0.29&nbsp;kB |
| `same` | 0.29&nbsp;kB |
| `in_array` | 0.19&nbsp;kB |
| `between` | 0.22&nbsp;kB |
| `digits_between` | 0.21&nbsp;kB |
| `file` | 0.18&nbsp;kB |
| `date` | 0.30&nbsp;kB |
| `numeric` | 0.21&nbsp;kB |
| `max` | 0.18&nbsp;kB |
| `min` | 0.20&nbsp;kB |
| `distinct` | 0.21&nbsp;kB |
| `size` | 0.20&nbsp;kB |
| `timezone` | 0.18&nbsp;kB |
| `digits` | 0.20&nbsp;kB |
| `confirmed` | 0.15&nbsp;kB |
| `integer` | 0.14&nbsp;kB |
| `date_equals` | 0.20&nbsp;kB |
| `uuid` | 0.27&nbsp;kB |
| `json` | 0.21&nbsp;kB |
| `accepted` | 0.19&nbsp;kB |
| `alpha_dash` | 0.18&nbsp;kB |
| `alpha` | 0.16&nbsp;kB |
| `alpha_num` | 0.17&nbsp;kB |
| `captcha` | 0.18&nbsp;kB |
| `boolean` | 0.19&nbsp;kB |
| `required` | 0.16&nbsp;kB |
| `filled` | 0.15&nbsp;kB |
| `in` | 0.17&nbsp;kB |
| `nullable` | 0.15&nbsp;kB |
| `array` | 0.17&nbsp;kB |
| `string` | 0.16&nbsp;kB |
| `not_in` | 0.20&nbsp;kB |
| **Total** | 2.79&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 1.86&nbsp;kB |
| `ip` | 1.90&nbsp;kB |
| `url` | 1.08&nbsp;kB |
| `before_or_equal` | 1.40&nbsp;kB |
| `after_or_equal` | 1.40&nbsp;kB |
| `before` | 1.38&nbsp;kB |
| `after` | 1.38&nbsp;kB |
| `ipv6` | 1.70&nbsp;kB |
| `not_regex` | 1.04&nbsp;kB |
| `regex` | 0.91&nbsp;kB |
| `gte` | 0.89&nbsp;kB |
| `lte` | 0.89&nbsp;kB |
| `gt` | 0.89&nbsp;kB |
| `lt` | 0.89&nbsp;kB |
| `email` | 0.79&nbsp;kB |
| `image` | 0.85&nbsp;kB |
| `date_format` | 0.88&nbsp;kB |
| `mimes` | 0.79&nbsp;kB |
| `different` | 0.76&nbsp;kB |
| `mimetypes` | 0.78&nbsp;kB |
| `ipv4` | 0.70&nbsp;kB |
| `same` | 0.75&nbsp;kB |
| `in_array` | 0.75&nbsp;kB |
| `between` | 0.71&nbsp;kB |
| `digits_between` | 0.72&nbsp;kB |
| `file` | 0.75&nbsp;kB |
| `date` | 0.80&nbsp;kB |
| `numeric` | 0.67&nbsp;kB |
| `max` | 0.67&nbsp;kB |
| `min` | 0.67&nbsp;kB |
| `distinct` | 0.70&nbsp;kB |
| `size` | 0.68&nbsp;kB |
| `timezone` | 0.65&nbsp;kB |
| `digits` | 0.67&nbsp;kB |
| `confirmed` | 0.63&nbsp;kB |
| `integer` | 0.63&nbsp;kB |
| `date_equals` | 0.64&nbsp;kB |
| `uuid` | 0.64&nbsp;kB |
| `json` | 0.63&nbsp;kB |
| `accepted` | 0.62&nbsp;kB |
| `alpha_dash` | 0.61&nbsp;kB |
| `alpha` | 0.61&nbsp;kB |
| `alpha_num` | 0.60&nbsp;kB |
| `captcha` | 0.62&nbsp;kB |
| `boolean` | 0.61&nbsp;kB |
| `required` | 0.60&nbsp;kB |
| `filled` | 0.59&nbsp;kB |
| `in` | 0.57&nbsp;kB |
| `nullable` | 0.58&nbsp;kB |
| `array` | 0.59&nbsp;kB |
| `string` | 0.59&nbsp;kB |
| `not_in` | 0.55&nbsp;kB |
| **Total** | 10.62&nbsp;kB |

</details>

## Locales

What each locale adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.74&nbsp;kB |
| `de_DE` | 1.60&nbsp;kB |
| `en_US` | 1.30&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.54&nbsp;kB |
| `de_DE` | 1.40&nbsp;kB |
| `en_US` | 1.14&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 7.40&nbsp;kB |
| `de_DE` | 6.62&nbsp;kB |
| `en_US` | 6.45&nbsp;kB |

</details>

## Themes

What a theme's token definitions add to the bundle.

<details open>
<summary><h3>Gzip</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 1.95&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 1.69&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 7.54&nbsp;kB |

</details>

<!--@size-end-->