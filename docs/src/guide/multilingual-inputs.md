---
outline: [2,3]
---

# Multilingual Inputs

[Locales](/guide/locales) translate the framework's own strings, and [translated props](/guide/translating-props) translate the texts you write. A **translatable input** translates what the _user_ writes — one field whose model value holds every language's copy side by side, the shape content-management forms need. Its languages are content slots in the data, not the UI language, so a form rendered in English can edit `en_US`, `fr_FR`, and `de_DE` content alike.

## Translatable Elements

Set `translate: true` on an element and give it a `languages` map, and its model value becomes an object keyed by language code instead of a single string:

```ts
{
  bio: {
    type: 'text',
    label: 'Bio',
    translate: true,
    languages: { en_US: 'English', fr_FR: 'French' },
  },
}

// model: { bio: { en_US: 'Hello there', fr_FR: 'Bonjour' } }
```

`translate` on its own is inert — the element only becomes translatable once at least one language resolves from the element, the form, or the global config, and the config ships none by default. [Configuring Available Languages](#configuring-available-languages) covers where the map can live.

The input shows one language at a time, and typing writes the active language's entry. The element's [context](/components/VfText#context) mirrors the split — `value` is the active language's entry, `model` the full language-keyed object.

Among the built-in elements, `!VfText` and `!VfTextarea` are translatable. Custom elements built on `!VfField` get the same capability and behave exactly as this chapter describes — see [Wrapping a Widget with `VfField`](/guide/components#wrapping-a-widget-with-VfField) for how to build one.

### Values and Defaults

`default` takes a language-keyed object, and languages missing from it start at the element's empty value. A plain-string `default` is applied to every language at once.

Values written from outside follow the same shape. Hand the [Model API](/guide/model#the-model-api) a language-keyed object and it replaces every language at once — `form$.set('bio', { en_US: 'Hi', fr_FR: 'Salut' })` — or reach a single language by its path, `form$.set('bio.fr_FR', 'Salut')`. An element `v-model` or seeded value for a translatable element must be an object; a scalar throws `Multilingual model must be an object`.

With `!defineSchema`, `translate: true` plus a literal `languages` map types the element's model as an object keyed by exactly those codes; without a `languages` prop the keys stay `string` — see [model](/guide/model#external-model) for how schema typing flows into the model.

## Configuring Available Languages

A language map pairs codes with display labels — the codes become the model's keys, the labels are what the switchers show. The map can live at three levels, and the most specific one wins:

| Level | Where |
| --- | --- |
| Global | `languages` in `createVueform()` |
| Form | `languages` on `!VfForm` or `!useForm` |
| Element | the element's `languages` prop |

The element form appeared above and the form level comes with the [form-level switcher](#form-level-language-switcher); the global map covers every form in the app:

```ts
createVueform({
  languages: { en_US: 'English', fr_FR: 'French' },
})
```

The config option's type and default live in [configuration](/guide/configuration#languages).

Labels can themselves be locale maps, resolving with the active [locale](/guide/locales) through the same chain as any [translated prop](/guide/translating-props#the-resolution-chain):

```ts
createVueform({
  languages: {
    en_US: { en_US: 'English', fr_FR: 'Anglais' },
    fr_FR: { en_US: 'French', fr_FR: 'Français' },
  },
})
```

### Headless Models

A `!useModel` instance expands translatable values with its own `languages` option, falling back to the global config — element `languages` props still win. Pass it the same map the attaching form gets, so both agree on the model's shape:

```ts
const model = useModel({ schema, languages: { en_US: 'English', fr_FR: 'French' } })
```

`!useForm`'s internal model takes the form's `languages` automatically. Headless reads of a translatable value — the `value` that [expressions](/guide/expressions) and rule references consume on an unmounted element — resolve to the first language, since only a mounted form switches languages.

## Per-Element Language Switcher

Every translatable element ships its own switcher — a compact language select rendered beside the input, after any addons the element defines (the placement belongs to [element layout](/guide/element-layout#the-language-addon)).

It starts on the element's own `language` prop when set; otherwise on the first key of the element's own `languages`; otherwise on the form's active language. Each element's choice is its own, so one element can edit a different language than its neighbors — French `body` beside English `title`, the side-by-side translation workflow. Screen-reader users hear which language an input is editing — see [ARIA Attributes](/guide/accessibility#aria-attributes).

The element's `#language` [slot](/guide/slots) replaces the select entirely, receiving the active `language` and the `languages` map, while the `language` [part](/guide/parts) merges props onto the `!VfAddon` that renders it.

## Form-Level Language Switcher

Editing many translatable elements one inline switcher at a time doesn't scale. Setting `multilingual` on the form renders a `!VfLanguages` button bar at the top of the form — before any tabs or steps — that drives every translatable element at once:

```ts
const [MyForm, form$, formReady] = useForm({
  multilingual: true,
  languages: { en_US: 'English', fr_FR: 'French' },
  schema: {
    title: { type: 'text', label: 'Title', translate: true },
    body: { type: 'textarea', label: 'Body', translate: true },
  },
})
```

Picking a language realigns every translatable element to it, discarding any per-element choice. An element whose own `languages` lack the picked code stays where it is, and Vueform logs a warning.

The same control is available in code on the [form context](/guide/context#form-context). The `language` prop sets the starting language (the first key of `languages` by default), `form$.language` reads the active one, `form$.languages` is the resolved label map, and `form$.selectLanguage(code)` switches:

```ts
formReady((form$) => {
  form$.language // 'en_US'
  form$.selectLanguage('fr_FR')
})
```

These drive the elements whether or not `multilingual` is set — the prop only adds the switcher UI.

Languages holding validation errors are marked on the switcher — each option carries `aria-invalid` and `data-invalid` — so the user sees which translation needs attention without visiting each one. The set behind the markers is `form$.invalidLanguages`.

The form's `#languages` slot replaces the whole switcher (scope `languages`, `language`, `invalidLanguages`, `select`, `bindings`), and `#language` replaces each option — see the [`!VfForm` slots reference](/components/VfForm#slots).

## Validation

A translatable element's rules run once per language. Each language validates independently and holds its own result, and the element is invalid while any language is. Error messages carry the language's label, so the user knows which translation failed:

```
The Bio must be at least 10 characters. (English)
The Bio field is required. (French)
```

The per-language results live on the element's [context](/components/VfText#context) — `invalidLanguages`, `validation` keyed by language, `currentValidation` for the active one, and `validateCurrent()` to validate just that.

To validate languages differently, key the `rules` prop by language code — the spec and how entries combine live in [Multilingual Rules](/guide/validation#multilingual-rules). Language-keyed rules on a non-translatable element throw.
