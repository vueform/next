# Bundle size — `@vueform/ui`

Generated at 2026-09-19T09:35:07.322Z. Sizes are the emitted JS and CSS assets of a production Vite build with default settings (esbuild minification for JS and CSS, no custom config), measured as deltas against a baseline (Vite app only, no Vueform).

Measured with:

- Node v26.8.2
- `pnpm@10.20.0`
- `vue@3.5.42`
- `vite@6.4.3`
- `@vueform/core@2.0.0`
- `@vueform/ui@2.0.0`

## How to interpret results

In tables with a **Total** row, the individual rows show the size that removing that item saves from the bundle, while the **Total** row is measured with all items added — it also contains code shared between items, so it can exceed the sum of the individual rows.

## Core

The size of the bare `createVueform` import — the smallest possible Vueform footprint. Modules, components, rules, locales and themes extend this size; for their numbers see the tables below.

|  | JS |
| --- | --- |
| Gzip | 4.63&nbsp;kB |
| Brotli | 4.13&nbsp;kB |
| Raw | 11.92&nbsp;kB |

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
| `VfForm` | 5.96&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 4.26&nbsp;kB | 0.18&nbsp;kB |
| `VfLayout` | 3.15&nbsp;kB | 0.54&nbsp;kB |
| `VfGrid` | 2.57&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 1.05&nbsp;kB | 1.00&nbsp;kB |
| `VfList` | 1.69&nbsp;kB | 0.17&nbsp;kB |
| `VfFile` | 1.63&nbsp;kB | 0.04&nbsp;kB |
| `VfNav` | 1.06&nbsp;kB | 0.07&nbsp;kB |
| `VfCheckboxes` | 0.94&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.82&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.34&nbsp;kB | 0.47&nbsp;kB |
| `VfSteps` | 0.17&nbsp;kB | 0.63&nbsp;kB |
| `VfCheckbox` | 0.79&nbsp;kB | -0.01&nbsp;kB |
| `VfRadio` | 0.77&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.73&nbsp;kB | 0.01&nbsp;kB |
| `VfSelect` | 0.54&nbsp;kB | 0.12&nbsp;kB |
| `VfText` | 0.53&nbsp;kB | 0.08&nbsp;kB |
| `VfTextarea` | 0.54&nbsp;kB | 0.04&nbsp;kB |
| `VfGroup` | 0.46&nbsp;kB | 0.08&nbsp;kB |
| `VfLanguages` | 0.41&nbsp;kB | 0.13&nbsp;kB |
| `VfContent` | 0.31&nbsp;kB | 0.04&nbsp;kB |
| `VfField` | 0.33&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.28&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.27&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.14&nbsp;kB | 0.12&nbsp;kB |
| `VfElements` | 0.15&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | 0.14&nbsp;kB | -0.05&nbsp;kB |
| **Total** | 54.52&nbsp;kB | 6.52&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 4.69&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 3.23&nbsp;kB | 0.15&nbsp;kB |
| `VfLayout` | 2.50&nbsp;kB | 0.43&nbsp;kB |
| `VfGrid` | 1.72&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.80&nbsp;kB | 0.78&nbsp;kB |
| `VfList` | 1.01&nbsp;kB | 0.15&nbsp;kB |
| `VfFile` | 0.96&nbsp;kB | 0.02&nbsp;kB |
| `VfNav` | 0.72&nbsp;kB | 0.05&nbsp;kB |
| `VfCheckboxes` | 0.13&nbsp;kB | 0.01&nbsp;kB |
| `VfRadios` | 0.04&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.16&nbsp;kB | 0.43&nbsp;kB |
| `VfSteps` | 0.08&nbsp;kB | 0.55&nbsp;kB |
| `VfCheckbox` | 0.34&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 0.28&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.47&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.32&nbsp;kB | 0.11&nbsp;kB |
| `VfText` | 0.26&nbsp;kB | 0.09&nbsp;kB |
| `VfTextarea` | 0.38&nbsp;kB | 0.02&nbsp;kB |
| `VfGroup` | 0.13&nbsp;kB | 0.06&nbsp;kB |
| `VfLanguages` | 0.13&nbsp;kB | 0.11&nbsp;kB |
| `VfContent` | 0.10&nbsp;kB | 0.04&nbsp;kB |
| `VfField` | 0.20&nbsp;kB | -0.01&nbsp;kB |
| `VfRow` | 0.01&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.15&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.00&nbsp;kB | 0.10&nbsp;kB |
| `VfElements` | 0.07&nbsp;kB | -0.01&nbsp;kB |
| `VfIcon` | 0.04&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 44.30&nbsp;kB | 5.63&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 19.31&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 18.18&nbsp;kB | 1.16&nbsp;kB |
| `VfLayout` | 12.22&nbsp;kB | 3.20&nbsp;kB |
| `VfGrid` | 8.15&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 4.79&nbsp;kB | 7.83&nbsp;kB |
| `VfList` | 8.38&nbsp;kB | 1.41&nbsp;kB |
| `VfFile` | 6.43&nbsp;kB | 0.26&nbsp;kB |
| `VfNav` | 5.49&nbsp;kB | 0.30&nbsp;kB |
| `VfCheckboxes` | 5.48&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 5.31&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 1.48&nbsp;kB | 3.87&nbsp;kB |
| `VfSteps` | 1.73&nbsp;kB | 4.37&nbsp;kB |
| `VfCheckbox` | 4.71&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 4.64&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 2.60&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 4.17&nbsp;kB | 0.82&nbsp;kB |
| `VfText` | 3.94&nbsp;kB | 0.53&nbsp;kB |
| `VfTextarea` | 4.03&nbsp;kB | 0.27&nbsp;kB |
| `VfGroup` | 3.29&nbsp;kB | 0.98&nbsp;kB |
| `VfLanguages` | 1.84&nbsp;kB | 1.09&nbsp;kB |
| `VfContent` | 2.10&nbsp;kB | 0.23&nbsp;kB |
| `VfField` | 2.71&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 1.23&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 1.55&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 1.60&nbsp;kB | 1.04&nbsp;kB |
| `VfElements` | 0.78&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | 0.73&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 203.29&nbsp;kB | 48.97&nbsp;kB |

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
| `material` | 4.01&nbsp;kB |
| `origin` | 4.01&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Theme | JS |
| --- | --- |
| `material` | 3.37&nbsp;kB |
| `origin` | 3.38&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Theme | JS |
| --- | --- |
| `material` | 17.35&nbsp;kB |
| `origin` | 17.33&nbsp;kB |

</details>
