# Bundle size — `@vueform/primevue`

Generated at 2026-09-16T09:24:39.718Z. Sizes are the emitted JS and CSS assets of a production Vite build with default settings (esbuild minification for JS and CSS, no custom config), measured as deltas against a baseline (Vite app only, no Vueform, no PrimeVue).

All numbers show only what Vueform adds **on top of PrimeVue** — matched builds importing the same raw `primevue/*` modules without Vueform are subtracted.

Measured with:

- Node v26.8.2
- `pnpm@10.20.0`
- `vue@3.5.42`
- `vite@6.4.3`
- `@vueform/core@2.0.0`
- `@vueform/primevue@2.0.0`
- `primevue@4.5.5`
- `@primeuix/themes@2.0.3`
- `primeicons@7.0.0`

## How to interpret results

In tables with a **Total** row, the individual rows show the size that removing that item saves from the bundle, while the **Total** row is measured with all items added — it also contains code shared between items, so it can exceed the sum of the individual rows.

## Core

The size of the bare `createVueform` import — the smallest possible Vueform footprint. Modules, components, rules, locales and themes extend this size; for their numbers see the tables below.

|  | JS |
| --- | --- |
| Gzip | 6.74&nbsp;kB |
| Brotli | 5.80&nbsp;kB |
| Raw | 17.30&nbsp;kB |

## Modules

What each module adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 7.95&nbsp;kB |
| `validation` | 7.01&nbsp;kB |
| `conditions` | 2.27&nbsp;kB |
| `autosave` | 1.70&nbsp;kB |
| `theme` | 1.46&nbsp;kB |
| `expression` | 1.38&nbsp;kB |
| `router` | 0.67&nbsp;kB |
| `http` | 0.44&nbsp;kB |
| `locale` | 0.36&nbsp;kB |
| `security` | 0.19&nbsp;kB |
| `date` | 0.17&nbsp;kB |
| **Total** | 23.37&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 7.24&nbsp;kB |
| `validation` | 6.27&nbsp;kB |
| `conditions` | 2.06&nbsp;kB |
| `autosave` | 1.55&nbsp;kB |
| `theme` | 1.32&nbsp;kB |
| `expression` | 1.33&nbsp;kB |
| `router` | 0.59&nbsp;kB |
| `http` | 0.39&nbsp;kB |
| `locale` | 0.36&nbsp;kB |
| `security` | 0.20&nbsp;kB |
| `date` | 0.11&nbsp;kB |
| **Total** | 20.71&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 24.36&nbsp;kB |
| `validation` | 20.96&nbsp;kB |
| `conditions` | 7.02&nbsp;kB |
| `autosave` | 4.64&nbsp;kB |
| `theme` | 3.92&nbsp;kB |
| `expression` | 3.77&nbsp;kB |
| `router` | 1.75&nbsp;kB |
| `http` | 1.15&nbsp;kB |
| `locale` | 0.96&nbsp;kB |
| `security` | 0.51&nbsp;kB |
| `date` | 0.37&nbsp;kB |
| **Total** | 68.81&nbsp;kB |

</details>

## Components

What each component adds to the bundle when registered, split into **JS** and **CSS** — a component imports exactly the theme chunks it needs, so its stylesheet cost is part of it.

Values near zero — even slightly negative, within ±0.2 kB — are compression noise: removing the item can make the compression slightly more effective, and that improvement can exceed the few bytes the item itself adds.

<details open>
<summary><h3>Gzip</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 8.55&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 4.99&nbsp;kB | 1.09&nbsp;kB |
| `VfLayout` | 3.55&nbsp;kB | 0.70&nbsp;kB |
| `VfEditor` | 2.26&nbsp;kB | 0.37&nbsp;kB |
| `VfList` | 2.37&nbsp;kB | 0.16&nbsp;kB |
| `VfGrid` | 2.40&nbsp;kB | 0.00&nbsp;kB |
| `VfListbox` | 2.27&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 1.94&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 1.88&nbsp;kB | 0.04&nbsp;kB |
| `VfNav` | 1.58&nbsp;kB | 0.12&nbsp;kB |
| `VfInputNumber` | 1.55&nbsp;kB | 0.00&nbsp;kB |
| `VfPassword` | 1.54&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 1.46&nbsp;kB | 0.02&nbsp;kB |
| `VfRadioButton` | 1.40&nbsp;kB | 0.00&nbsp;kB |
| `VfDatePicker` | 1.37&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.65&nbsp;kB | 0.56&nbsp;kB |
| `VfMultiSelect` | 1.15&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | 1.03&nbsp;kB | 0.01&nbsp;kB |
| `VfCascadeSelect` | 0.97&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButtonGroup` | 0.96&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 0.94&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | 0.91&nbsp;kB | -0.01&nbsp;kB |
| `VfCol` | 0.81&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.78&nbsp;kB | 0.02&nbsp;kB |
| `VfGroup` | 0.55&nbsp;kB | 0.07&nbsp;kB |
| `VfCheckbox` | 0.59&nbsp;kB | 0.00&nbsp;kB |
| `VfSlider` | 0.54&nbsp;kB | 0.04&nbsp;kB |
| `VfToggleSwitch` | 0.52&nbsp;kB | 0.04&nbsp;kB |
| `VfSelect` | 0.54&nbsp;kB | 0.00&nbsp;kB |
| `VfInputText` | 0.48&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 0.44&nbsp;kB | 0.00&nbsp;kB |
| `VfInputMask` | 0.44&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.35&nbsp;kB | 0.04&nbsp;kB |
| `VfRow` | 0.33&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | 0.31&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 0.25&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.17&nbsp;kB | 0.00&nbsp;kB |
| `VfSelectButton` | 0.12&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | 0.07&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | -0.07&nbsp;kB | 0.04&nbsp;kB |
| **Total** | 78.68&nbsp;kB | 5.51&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 6.19&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 3.33&nbsp;kB | 0.92&nbsp;kB |
| `VfLayout` | 2.81&nbsp;kB | 0.59&nbsp;kB |
| `VfEditor` | 1.15&nbsp;kB | 0.31&nbsp;kB |
| `VfList` | 0.92&nbsp;kB | 0.15&nbsp;kB |
| `VfGrid` | 1.60&nbsp;kB | 0.00&nbsp;kB |
| `VfListbox` | -0.41&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 0.49&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 0.24&nbsp;kB | 0.04&nbsp;kB |
| `VfNav` | 0.86&nbsp;kB | 0.09&nbsp;kB |
| `VfInputNumber` | 0.33&nbsp;kB | 0.00&nbsp;kB |
| `VfPassword` | -0.25&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 0.47&nbsp;kB | 0.01&nbsp;kB |
| `VfRadioButton` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfDatePicker` | 0.51&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | -0.11&nbsp;kB | 0.46&nbsp;kB |
| `VfMultiSelect` | -0.11&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | -0.20&nbsp;kB | 0.00&nbsp;kB |
| `VfCascadeSelect` | -0.19&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButtonGroup` | -0.09&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 0.36&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | 0.13&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.48&nbsp;kB | -0.01&nbsp;kB |
| `VfButton` | 0.47&nbsp;kB | 0.01&nbsp;kB |
| `VfGroup` | 0.32&nbsp;kB | 0.03&nbsp;kB |
| `VfCheckbox` | -0.22&nbsp;kB | -0.01&nbsp;kB |
| `VfSlider` | -0.27&nbsp;kB | 0.03&nbsp;kB |
| `VfToggleSwitch` | 0.26&nbsp;kB | 0.03&nbsp;kB |
| `VfSelect` | -0.07&nbsp;kB | 0.00&nbsp;kB |
| `VfInputText` | -0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 0.16&nbsp;kB | 0.00&nbsp;kB |
| `VfInputMask` | -0.18&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.10&nbsp;kB | 0.01&nbsp;kB |
| `VfRow` | 0.05&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | 0.10&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.02&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | -0.16&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | -0.08&nbsp;kB | -0.02&nbsp;kB |
| `VfSelectButton` | -0.19&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | -0.10&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | -0.12&nbsp;kB | 0.02&nbsp;kB |
| **Total** | 49.19&nbsp;kB | 4.80&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 25.08&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 18.02&nbsp;kB | 17.00&nbsp;kB |
| `VfLayout` | 14.84&nbsp;kB | 4.10&nbsp;kB |
| `VfEditor` | 7.92&nbsp;kB | 2.02&nbsp;kB |
| `VfList` | 8.30&nbsp;kB | 1.41&nbsp;kB |
| `VfGrid` | 7.86&nbsp;kB | 0.00&nbsp;kB |
| `VfListbox` | 3.55&nbsp;kB | 0.00&nbsp;kB |
| `VfTreeSelect` | 6.09&nbsp;kB | 0.00&nbsp;kB |
| `VfFileUpload` | 4.82&nbsp;kB | 0.23&nbsp;kB |
| `VfNav` | 5.45&nbsp;kB | 0.49&nbsp;kB |
| `VfInputNumber` | 4.17&nbsp;kB | 0.00&nbsp;kB |
| `VfPassword` | 3.67&nbsp;kB | 0.00&nbsp;kB |
| `VfColorPicker` | 4.21&nbsp;kB | 0.09&nbsp;kB |
| `VfRadioButton` | 5.09&nbsp;kB | 0.00&nbsp;kB |
| `VfDatePicker` | 5.44&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 1.40&nbsp;kB | 4.91&nbsp;kB |
| `VfMultiSelect` | 4.25&nbsp;kB | 0.00&nbsp;kB |
| `VfRating` | 2.80&nbsp;kB | 0.07&nbsp;kB |
| `VfCascadeSelect` | 4.10&nbsp;kB | 0.00&nbsp;kB |
| `VfRadioButtonGroup` | 5.37&nbsp;kB | 0.00&nbsp;kB |
| `VfAutoComplete` | 5.08&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxGroup` | 5.46&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 2.59&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 4.04&nbsp;kB | 0.16&nbsp;kB |
| `VfGroup` | 3.29&nbsp;kB | 0.98&nbsp;kB |
| `VfCheckbox` | 5.05&nbsp;kB | 0.00&nbsp;kB |
| `VfSlider` | 2.73&nbsp;kB | 0.19&nbsp;kB |
| `VfToggleSwitch` | 3.55&nbsp;kB | 0.16&nbsp;kB |
| `VfSelect` | 4.15&nbsp;kB | 0.00&nbsp;kB |
| `VfInputText` | 3.70&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 3.06&nbsp;kB | 0.00&nbsp;kB |
| `VfInputMask` | 3.67&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 2.02&nbsp;kB | 0.23&nbsp;kB |
| `VfRow` | 1.23&nbsp;kB | 0.00&nbsp;kB |
| `VfToggleButton` | 3.18&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 1.54&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 3.55&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.77&nbsp;kB | 0.02&nbsp;kB |
| `VfSelectButton` | 3.25&nbsp;kB | 0.00&nbsp;kB |
| `VfInputOtp` | 3.01&nbsp;kB | 0.00&nbsp;kB |
| `VfKnob` | 2.77&nbsp;kB | 0.22&nbsp;kB |
| **Total** | 267.49&nbsp;kB | 47.75&nbsp;kB |

</details>

## Rules

What each rule adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.62&nbsp;kB |
| `before_or_equal` | 0.47&nbsp;kB |
| `ip` | 0.47&nbsp;kB |
| `after_or_equal` | 0.47&nbsp;kB |
| `before` | 0.45&nbsp;kB |
| `url` | 0.45&nbsp;kB |
| `after` | 0.45&nbsp;kB |
| `ipv6` | 0.40&nbsp;kB |
| `gte` | 0.32&nbsp;kB |
| `lte` | 0.32&nbsp;kB |
| `gt` | 0.32&nbsp;kB |
| `lt` | 0.32&nbsp;kB |
| `email` | 0.29&nbsp;kB |
| `not_regex` | 0.29&nbsp;kB |
| `image` | 0.29&nbsp;kB |
| `mimes` | 0.29&nbsp;kB |
| `different` | 0.29&nbsp;kB |
| `mimetypes` | 0.29&nbsp;kB |
| `date_format` | 0.28&nbsp;kB |
| `same` | 0.28&nbsp;kB |
| `in_array` | 0.27&nbsp;kB |
| `ipv4` | 0.27&nbsp;kB |
| `regex` | 0.26&nbsp;kB |
| `between` | 0.26&nbsp;kB |
| `digits_between` | 0.25&nbsp;kB |
| `max` | 0.25&nbsp;kB |
| `date` | 0.25&nbsp;kB |
| `min` | 0.25&nbsp;kB |
| `numeric` | 0.24&nbsp;kB |
| `size` | 0.24&nbsp;kB |
| `digits` | 0.23&nbsp;kB |
| `distinct` | 0.23&nbsp;kB |
| `file` | 0.23&nbsp;kB |
| `in` | 0.23&nbsp;kB |
| `timezone` | 0.23&nbsp;kB |
| `date_equals` | 0.22&nbsp;kB |
| `confirmed` | 0.22&nbsp;kB |
| `not_in` | 0.22&nbsp;kB |
| `alpha_dash` | 0.22&nbsp;kB |
| `uuid` | 0.22&nbsp;kB |
| `accepted` | 0.21&nbsp;kB |
| `captcha` | 0.21&nbsp;kB |
| `alpha` | 0.21&nbsp;kB |
| `alpha_num` | 0.21&nbsp;kB |
| `integer` | 0.21&nbsp;kB |
| `boolean` | 0.21&nbsp;kB |
| `json` | 0.20&nbsp;kB |
| `required` | 0.20&nbsp;kB |
| `filled` | 0.20&nbsp;kB |
| `array` | 0.19&nbsp;kB |
| `nullable` | 0.19&nbsp;kB |
| `string` | 0.19&nbsp;kB |
| **Total** | 3.15&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.63&nbsp;kB |
| `before_or_equal` | 0.49&nbsp;kB |
| `ip` | 0.47&nbsp;kB |
| `after_or_equal` | 0.45&nbsp;kB |
| `before` | 0.43&nbsp;kB |
| `url` | 0.39&nbsp;kB |
| `after` | 0.39&nbsp;kB |
| `ipv6` | 0.42&nbsp;kB |
| `gte` | 0.36&nbsp;kB |
| `lte` | 0.38&nbsp;kB |
| `gt` | 0.28&nbsp;kB |
| `lt` | 0.29&nbsp;kB |
| `email` | 0.21&nbsp;kB |
| `not_regex` | 0.31&nbsp;kB |
| `image` | 0.19&nbsp;kB |
| `mimes` | 0.27&nbsp;kB |
| `different` | 0.24&nbsp;kB |
| `mimetypes` | 0.27&nbsp;kB |
| `date_format` | 0.31&nbsp;kB |
| `same` | 0.29&nbsp;kB |
| `in_array` | 0.26&nbsp;kB |
| `ipv4` | 0.26&nbsp;kB |
| `regex` | 0.23&nbsp;kB |
| `between` | 0.19&nbsp;kB |
| `digits_between` | 0.25&nbsp;kB |
| `max` | 0.19&nbsp;kB |
| `date` | 0.24&nbsp;kB |
| `min` | 0.27&nbsp;kB |
| `numeric` | 0.25&nbsp;kB |
| `size` | 0.21&nbsp;kB |
| `digits` | 0.18&nbsp;kB |
| `distinct` | 0.24&nbsp;kB |
| `file` | 0.21&nbsp;kB |
| `in` | 0.25&nbsp;kB |
| `timezone` | 0.25&nbsp;kB |
| `date_equals` | 0.25&nbsp;kB |
| `confirmed` | 0.17&nbsp;kB |
| `not_in` | 0.19&nbsp;kB |
| `alpha_dash` | 0.21&nbsp;kB |
| `uuid` | 0.21&nbsp;kB |
| `accepted` | 0.20&nbsp;kB |
| `captcha` | 0.27&nbsp;kB |
| `alpha` | 0.24&nbsp;kB |
| `alpha_num` | 0.25&nbsp;kB |
| `integer` | 0.28&nbsp;kB |
| `boolean` | 0.20&nbsp;kB |
| `json` | 0.20&nbsp;kB |
| `required` | 0.22&nbsp;kB |
| `filled` | 0.20&nbsp;kB |
| `array` | 0.17&nbsp;kB |
| `nullable` | 0.17&nbsp;kB |
| `string` | 0.14&nbsp;kB |
| **Total** | 2.78&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 1.89&nbsp;kB |
| `before_or_equal` | 1.52&nbsp;kB |
| `ip` | 1.86&nbsp;kB |
| `after_or_equal` | 1.52&nbsp;kB |
| `before` | 1.50&nbsp;kB |
| `url` | 1.04&nbsp;kB |
| `after` | 1.49&nbsp;kB |
| `ipv6` | 1.67&nbsp;kB |
| `gte` | 0.93&nbsp;kB |
| `lte` | 0.93&nbsp;kB |
| `gt` | 0.93&nbsp;kB |
| `lt` | 0.93&nbsp;kB |
| `email` | 0.75&nbsp;kB |
| `not_regex` | 0.83&nbsp;kB |
| `image` | 0.84&nbsp;kB |
| `mimes` | 0.89&nbsp;kB |
| `different` | 0.83&nbsp;kB |
| `mimetypes` | 0.88&nbsp;kB |
| `date_format` | 0.90&nbsp;kB |
| `same` | 0.82&nbsp;kB |
| `in_array` | 0.80&nbsp;kB |
| `ipv4` | 0.70&nbsp;kB |
| `regex` | 0.74&nbsp;kB |
| `between` | 0.74&nbsp;kB |
| `digits_between` | 0.75&nbsp;kB |
| `max` | 0.70&nbsp;kB |
| `date` | 0.80&nbsp;kB |
| `min` | 0.70&nbsp;kB |
| `numeric` | 0.66&nbsp;kB |
| `size` | 0.71&nbsp;kB |
| `digits` | 0.70&nbsp;kB |
| `distinct` | 0.69&nbsp;kB |
| `file` | 0.75&nbsp;kB |
| `in` | 0.67&nbsp;kB |
| `timezone` | 0.65&nbsp;kB |
| `date_equals` | 0.67&nbsp;kB |
| `confirmed` | 0.63&nbsp;kB |
| `not_in` | 0.65&nbsp;kB |
| `alpha_dash` | 0.60&nbsp;kB |
| `uuid` | 0.63&nbsp;kB |
| `accepted` | 0.61&nbsp;kB |
| `captcha` | 0.62&nbsp;kB |
| `alpha` | 0.60&nbsp;kB |
| `alpha_num` | 0.60&nbsp;kB |
| `integer` | 0.63&nbsp;kB |
| `boolean` | 0.60&nbsp;kB |
| `json` | 0.63&nbsp;kB |
| `required` | 0.60&nbsp;kB |
| `filled` | 0.59&nbsp;kB |
| `array` | 0.58&nbsp;kB |
| `nullable` | 0.58&nbsp;kB |
| `string` | 0.59&nbsp;kB |
| **Total** | 10.56&nbsp;kB |

</details>

## Locales

What each locale adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.85&nbsp;kB |
| `de_DE` | 1.69&nbsp;kB |
| `en_US` | 1.39&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.66&nbsp;kB |
| `de_DE` | 1.45&nbsp;kB |
| `en_US` | 1.19&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 7.41&nbsp;kB |
| `de_DE` | 6.62&nbsp;kB |
| `en_US` | 6.46&nbsp;kB |

</details>

## Themes

What a theme's token definitions add to the bundle.

<details open>
<summary><h3>Gzip</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 1.96&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 1.70&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Theme | JS |
| --- | --- |
| Default theme | 7.37&nbsp;kB |

</details>
