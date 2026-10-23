---
outline: [2,3]
---

# Form Structure

A form lays its elements out on a 12-column grid, and an element that doesn't declare a width takes all twelve — which is why a fresh form renders one field per row. Layout is declared on the elements themselves rather than in CSS — widths, groups, table-like grids, and section dividers are all props, so the layout travels with a schema stored as JSON just like labels and rules do.

## The 12-Column Grid

The form, every group, and every list row lay their children on a 12-column grid. The `columns` prop sets how many of those columns an element occupies, and an element without it takes the full row:

```ts
first_name: { type: 'text', label: 'First name', columns: 6 },
last_name: { type: 'text', label: 'Last name', columns: 6 },
```

The two fields render side by side, each taking half the row. Elements fill a row left to right and wrap to a new one once the next width would push the total past 12 — nothing ever overflows. The column count is fixed at twelve, while the gaps between columns and rows come from the `gutter` token family — see [primitives](/guide/themes-tokens#primitives).

### Responsive Breakpoints

A plain number applies at every viewport size. An object keyed by breakpoint names sets a width per viewport instead, mobile-first — each key applies from its threshold up, until a larger key takes over:

```ts
first_name: { type: 'text', label: 'First name', columns: { md: 6 } },
last_name: { type: 'text', label: 'Last name', columns: { md: 6 } },
```

On phones each field takes the full row; from `md` up they sit side by side. Five breakpoints are defined by default:

| Breakpoint | Applies from |
| --- | --- |
| `sm` | `640px` |
| `md` | `768px` |
| `lg` | `1024px` |
| `xl` | `1280px` |
| `2xl` | `1536px` |

Keys combine freely — `{ sm: 6, md: 3 }` is 12 columns below `640px`, 6 from `640px`, and 3 from `768px` up. Below the smallest key the element is full width; the `base` key sets that starting width instead:

```ts
columns: { base: 6, md: 3 }
```

Both the breakpoint names and their widths are configurable — see [breakpoints](/guide/configuration#breakpoints).

### Desktop-First

Setting `mobileFirst: false` in `createVueform` flips every breakpoint to apply from its width **downward** — the generated grid CSS switches from `min-width` to `max-width` queries, so `base` becomes the widest layout:

```ts
createVueform({
  mobileFirst: false, // [!code highlight]
})
```

The same 12 / 6 / 3 layout is then authored from the wide end — `columns: { base: 3, md: 6, sm: 12 }`:

| Viewport | Columns |
| --- | --- |
| Above `768px` | 3 |
| `640px`–`768px` | 6 |
| Below `640px` | 12 |

The mode is app-wide — the grid CSS is generated once at install, so individual forms and elements can't opt out.

## Sizing Inside the Element

`columns` sizes more than the element itself. In place of a number it takes an object of three keys — `container` is the element's own width on the parent grid, while `label` and `wrapper` size parts inside the element — and a plain number is shorthand for `{ container: n }`. The keys combine in one object, and inside breakpoint keys:

```ts
columns: { container: 6, label: 4 }
columns: { md: { container: 6, label: 4 } }
```

### Horizontal Labels

A `label` width between 1 and 11 moves the label beside the control, taking that many of the element's twelve columns while the control takes the rest:

```ts
first_name: { type: 'text', label: 'First name', columns: { label: 4 } },
last_name: { type: 'text', label: 'Last name', columns: { label: 4 } },
```

Paired with a breakpoint — `columns: { md: { label: 4 } }` — labels stay on top on phones and move beside the control on wider screens. An element with horizontal columns but no label renders an empty placeholder in the label column, so its control still lines up with its labeled siblings. Under `dir="rtl"` the layout mirrors on its own, with the label on the right.

The classes behind horizontal and vertical labels are produced by the `label` config function — see [label](/guide/configuration#label) for porting them to another grid system.

### Narrowing Inputs

`wrapper` narrows the control itself while the element keeps its full width. Unlike `container` — which frees the remaining columns and lets the next element move up beside it — a wrapper-narrowed element still owns its row, and its description and error messages still span it:

```ts
age: { type: 'text', label: 'Age', columns: { wrapper: 2 } },
```

## Dynamic Column Widths

`columns` also accepts a function. It receives the element's [context](/guide/context#context-from-argument), returns any of the forms above, and re-runs reactively whenever something it read changes:

```ts
country: { type: 'select', label: 'Country', items: ['US', 'Other'] },
city: {
  type: 'text',
  label: 'City',
  columns: ({ form$ }) => (form$?.model.country === 'US' ? 6 : 12), // [!code highlight]
},
```

An [expression](/guide/expressions) string does the same and survives serialization. It's written bare — braces are optional — and resolves against the form data, with `@model` reading the element's own value. A string can also sit inside breakpoint keys or the `container` / `label` / `wrapper` keys:

```ts
columns: "country == 'US' ? 6 : 12"
```

Operators like these need the expression engine — the [`@vueform/expr-eval`](/plugins/expr-eval) plugin. Without it the string falls back to full width. `columns` also obeys the expression whitelist, so a restricted whitelist must list it for strings to resolve — see [restriction levels](/guide/expressions#restriction-levels).

## Grouping Elements

`!VfGroup` wraps elements that belong together. Its children lay out on the group's own 12-column grid, while the group itself is sized by its own `columns` on the parent's:

```ts
name: {
  type: 'group',
  label: 'Name',
  schema: {
    first: { type: 'text', columns: 6 },
    last: { type: 'text', columns: 6 },
  },
},
```

The group adds one `label`, `help`, and `description` for the whole set — a labeled group renders as a `<fieldset>`, covered in [label](/guide/element-layout#label) — and one place for props that should cover every child. `conditions` on the group makes the whole branch appear and disappear together, and `disabled` cascades to every element inside. The `heading` prop promotes the label to an `<h1>`–`<h6>` section heading — see [headings](/guide/element-layout#headings). A group standing in for one logical field can collect its children's errors under its own label with `hoist` — see [hoisting errors](/guide/validation#hoisting-errors).

### Nesting Data

By default a group is purely visual — its children write straight into the parent's data level, as if the group weren't there. `nested: true` makes the group own a sub-object under its name:

```ts
address: {
  type: 'group',
  label: 'Address',
  nested: true, // [!code highlight]
  schema: {
    street: { type: 'text', label: 'Street' },
    city: { type: 'text', label: 'City' },
    zip: { type: 'text', label: 'ZIP' },
  },
},
```

The model becomes `{ address: { street, city, zip } }` instead of three top-level keys. Nested and non-nested groups mix freely at any depth. A non-nested group is the case where an element's tree path and data path diverge — see [element paths](/guide/element-paths) — and how the model assembles from the tree is covered in [model](/guide/model).

### Wrapped Groups

`wrap: true` draws a bordered, padded container around the whole group, label included, while `innerWrap: true` boxes only the children and leaves the label outside:

```ts
address: {
  type: 'group',
  label: 'Address',
  wrap: true, // [!code highlight]
  schema: {
    street: { type: 'text', label: 'Street' },
    city: { type: 'text', label: 'City' },
  },
},
```

The box's look comes from the `groupWrapped*` tokens — see the [`VfGroup` tokens](/components/VfGroup#tokens).

### Stacked Groups

`stacked` swaps the group's grid for a wrapping flex row, so children sit side by side at their natural width — the layout for buttons and other intrinsically sized elements:

```ts
actions: {
  type: 'group',
  stacked: true, // [!code highlight]
  schema: {
    save: { type: 'button', text: 'Save' },
    preview: { type: 'button', text: 'Preview' },
    cancel: { type: 'button', text: 'Cancel', severity: 'secondary' },
  },
},
```

`!VfForm` takes `stacked` too, applying the same layout to its direct children, and `!VfCheckboxes` / `!VfRadios` have their own `stacked`, which lines up their options in a row.

### Tabbed Groups

`tabbed` turns the group's direct children into tabs, with each child's `page` prop supplying the tab label. A tab that should hold several elements is itself a group:

```ts
settings: {
  type: 'group',
  label: 'Settings',
  tabbed: true, // [!code highlight]
  schema: {
    profile: {
      type: 'group',
      page: 'Profile',
      schema: {
        name: { type: 'text', label: 'Name' },
      },
    },
    security: {
      type: 'group',
      page: 'Security',
      schema: {
        password: { type: 'text', inputType: 'password', label: 'Password' },
      },
    },
  },
},
```

Groups only tab — the sequential `stepped` wizard is a form-level mode, covered in [multi-page forms](/guide/multi-page-forms). Conditions on a tab's element remove the whole tab (see [conditional pages](/guide/conditions#conditional-pages)), and the pager, the page metadata, and the `tab` / `beforeTab` events work exactly as on a tabbed form.

## Grid Layout

The 12-column grid is one-dimensional — each row is independent, so column edges don't line up across rows. `!VfGrid` is a real two-dimensional CSS grid in which every cell shares the same column tracks. Its `grid` prop takes a 2D array — each inner array a row, each item a cell:

```ts
contact: {
  type: 'grid',
  grid: [
    [
      { type: 'text', name: 'first_name', placeholder: 'First name' },
      { type: 'text', name: 'last_name', placeholder: 'Last name' },
    ],
    [
      { type: 'text', name: 'email', placeholder: 'Email' },
      { type: 'text', name: 'phone', placeholder: 'Phone' },
    ],
  ],
},
```

In templates the same block is built from components — `!VfRow` inside `!VfGrid`, `!VfCol` inside `!VfRow`, elements inside `!VfCol`:

```vue
<VfGrid name="contact">
  <VfRow>
    <VfCol><VfText name="first_name" placeholder="First name" /></VfCol>
    <VfCol><VfText name="last_name" placeholder="Last name" /></VfCol>
  </VfRow>
  <VfRow>
    <VfCol><VfText name="email" placeholder="Email" /></VfCol>
    <VfCol><VfText name="phone" placeholder="Phone" /></VfCol>
  </VfRow>
</VfGrid>
```

Like a group, a grid writes its children into the parent's data, and `nested` collects them under the grid's own key.

### Cells

A cell in the `grid` array is an element schema object, a string, or `null` for an empty cell. String cells resolve `{...}` [expressions](/guide/expressions) and render as plain text — they render as HTML only when `grid` is listed in `$security.allowHtml`, sanitized as [HTML sanitization](/guide/security#html-sanitization) describes.

Besides its element schema, an object cell takes a handful of layout keys — `colspan`, `rowspan`, `align`, `valign`, and `attrs` (HTML attributes for the cell wrapper) — with `content` carrying the text of a non-element cell. The same props go on `!VfCol` in templates:

```ts
contact: {
  type: 'grid',
  grid: [
    [
      { type: 'text', name: 'first_name', placeholder: 'First name' },
      { type: 'text', name: 'last_name', placeholder: 'Last name' },
    ],
    [{ type: 'textarea', name: 'bio', placeholder: 'Bio', colspan: 2 }], // [!code highlight]
  ],
},
```

An element cell without a `name` gets a position-derived one (`{grid}_{row}_{col}`), so name the cells whose data matters. The rest of the grid surface lives on its [reference page](/components/VfGrid) — column and row headers (`colHeaders`, `rowHeaders`, and `header` on `!VfCol`), column `widths` (numbers are pixels, strings any CSS track value), grid-wide `align` / `valign` (defaulting to `left` / `baseline`), and `scrollable` with `minWidth` / `maxWidth`.

## Matrix Layout

`!VfMatrix` is the grid's structured sibling — instead of placing cells one by one, you define `cols` and `rows` and it renders an input at every intersection, with headers along both axes. It's the element for survey scales, schedules, and scoring tables:

```ts
schedule: {
  type: 'matrix',
  label: 'Schedule',
  cols: { morning: 'Morning', evening: 'Evening' },
  rows: { monday: 'Monday', tuesday: 'Tuesday' },
},
```

Each cell is a text input by default, and the value is an object keyed by row value, each row an object keyed by column value — `{ monday: { morning: '', evening: '' }, … }`. With `rows` omitted (and no `endpoint`) or given as a number, the matrix becomes a dynamic add/remove repeater whose value is an array — see [matrix repeater](/guide/repeaters#matrix-repeater).

### Selection Modes

The `mode` prop decides what the cells are and what each row's value becomes:

| Mode | Cells | Row value |
| --- | --- | --- |
| `auto` (default) | An independent input per cell | An object keyed by column value |
| `single` | A radio per cell | The chosen column's value |
| `multiple` | A checkbox per cell | An array of the chosen columns' values |

```ts
survey: {
  type: 'matrix',
  label: 'How satisfied are you with…',
  mode: 'single', // [!code highlight]
  cols: { bad: 'Bad', ok: 'OK', great: 'Great' },
  rows: { support: 'Support', pricing: 'Pricing' },
},
```

The element types behind each mode are configurable — see [matrixTypes](/guide/configuration#matrixtypes).

### Custom Cell Types

A column in the detailed format — `{ value, label, schema }` — puts a custom element in that column's cells. `schema.type` is optional and falls back to the mode's cell type, and every other key passes through to the cell element:

```ts
availability: {
  type: 'matrix',
  label: 'Availability',
  cols: [
    {
      value: 'status',
      label: 'Status',
      schema: { type: 'select', items: ['Free', 'Busy'] }, // [!code highlight]
    },
    { value: 'note', label: 'Note' },
  ],
  rows: { monday: 'Monday' },
},
```

Matrix cells always render without their element layout — no label or error block per cell. Conditional columns and rows ([conditional matrix rows and columns](/guide/conditions#conditional-matrix-rows-and-columns)), loading `cols` / `rows` from an `endpoint`, per-column width limits, `scrollable` with sticky headers, and row sorting are covered on the [reference page](/components/VfMatrix).

## Tabular Mode

`tabular` on `!VfGrid` or `!VfMatrix` renders the element as a bordered table — shared cell borders, header backgrounds, and rounded outer corners:

```ts
order: {
  type: 'grid',
  tabular: true, // [!code highlight]
  colHeaders: true,
  rowHeaders: true,
  grid: [
    ['Product', 'Qty'],
    ['Standard license', { type: 'text', name: 'standard_qty' }],
    ['Extended license', { type: 'text', name: 'extended_qty' }],
  ],
},
```

In tabular mode, element cells from a `grid` array drop their layout so inputs fill the cell — matrix cells render without layout in every mode. Elements placed inside `!VfCol` in a template don't get this automatically — add `:layout="false"` to them yourself, as [removing the layout](/guide/element-layout#removing-the-layout) describes. The table's look comes from the `tabular*` tokens, listed for [`VfGrid`](/components/VfGrid#tokens) and [`VfMatrix`](/components/VfMatrix#tokens), with the override mechanism in [overriding tokens](/guide/themes-tokens#overriding-tokens).

## Spacing & Dividers

Sections often need separating without a full group around them. Four props available on every element — containers included — add space and rules directly:

| Prop | Value | Effect |
| --- | --- | --- |
| `spaceTop` / `spaceBottom` | `1`, `2`, or `3` | Padding above / below the element |
| `lineTop` / `lineBottom` | `boolean` | A horizontal rule above / below the element |

```ts
phone: { type: 'text', label: 'Phone', spaceBottom: 2 },
address: { type: 'text', label: 'Address', spaceTop: 2, lineTop: true },
```

The values `1`–`3` map to the `space1`–`space3` tokens (`1rem` / `2rem` / `3rem` by default — see [primitives](/guide/themes-tokens#primitives)), and any other value adds nothing. The line is a 1px border on the element itself in the `elementLineColor` token, and since the spacing is padding inside that border, `lineTop` plus `spaceTop` puts the space between the line and the content. When a section needs more than a line — a shared label, a box — reach for a [group](#grouping-elements).
