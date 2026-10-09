<script setup>
import { ref } from 'vue'

const loading = ref(false)

const handleLoadingClick = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 1500)
}

const handleSubmitClick = (e, { form$ }) => alert(`Hello ${form$.model.name || 'there'}!`)
</script>

# VfButton

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

<!-- #region usage-basic -->

## Basic

A simple button with label text.

::: usage center nomodel

```vue [Preview]
<VfButton name="submit" text="Button" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  submit: { type: 'button', text: 'Button' },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-basic -->

<!-- #region usage-actions -->

## Actions

Use the `action` prop to trigger form actions. Set it to `'submit'` to submit the form or `'reset'` to reset all elements to their default values.

::: usage fit

```vue [Preview]
<VfButton name="submit" text="Submit" action="submit" />
<VfButton name="reset" text="Reset" action="reset" />
```

```vue [Template]
<script setup lang="ts">
const handleClick = ({ form$ }) => {
  alert(`Hello ${form$.model.name || 'there'}!`)
}
</script>

<template>
  <VfForm stacked>
    <VfText name="name" placeholder="Type your name" />
    <VfButton
      name="submit"
      text="Submit"
      action="submit"
      @click="handleClick"
    />
    <VfButton name="reset" text="Reset" action="reset" />
  </VfForm>
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const handleClick = ({ form$ }) => {
  alert(`Hello ${form$.model.name || 'there'}!`)
}

const schema = defineSchema({
  actions: {
    type: 'group',
    stacked: true,
    schema: {
      name: { type: 'text', placeholder: 'Type your name' },
      submit: {
        type: 'button',
        text: 'Submit',
        action: 'submit',
        onClick: handleClick,
      },
      reset: { type: 'button', text: 'Reset', action: 'reset' },
    }
  }
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

```vue [Live]
<VfForm name="actions" stacked>
  <VfText name="name" placeholder="Type your name" />
  <VfButton name="submit" text="Submit" action="submit" @click="handleSubmitClick" />
  <VfButton name="reset" text="Reset" action="reset" />
</VfForm>
```

:::

<!-- #endregion usage-actions -->

<!-- #region usage-icons -->

## Icons

Use the `icon` prop to display an icon inside the button. Control icon placement with `iconPos` — `'left'` (default), `'right'`, `'top'`, or `'bottom'`. When no `text` is provided, the button renders as an icon-only button.

::: usage center nomodel

```vue [Preview]
<VfButton name="home" icon="home" />
<VfButton name="profile" text="Profile" icon="user" icon-pos="left" />
<VfButton name="save" text="Save" icon="check" icon-pos="right" />
<VfButton name="search" text="Search" icon="search" icon-pos="top" />
<VfButton name="update" text="Update" icon="redo" icon-pos="bottom" />
```

```vue [Template]
<VfGroup name="icons1" stacked>
  <VfButton name="home" icon="home" />
  <VfButton
    name="profile"
    text="Profile"
    icon="user"
  />
  <VfButton
    name="save"
    text="Save"
    icon="check"
    icon-pos="right"
  />
</VfGroup>
<VfGroup name="icons2" stacked>
  <VfButton
    name="search"
    text="Search"
    icon="search"
    icon-pos="top"
  />
  <VfButton
    name="update"
    text="Update"
    icon="redo"
    icon-pos="bottom"
  />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  icons1: {
    type: 'group',
    stacked: true,
    schema: {
      home: { type: 'button', icon: 'home' },
      profile: { type: 'button', text: 'Profile', icon: 'user', iconPos: 'left' },
      save: { type: 'button', text: 'Save', icon: 'check', iconPos: 'right' },
    }
  },
  icons2: {
    type: 'group',
    stacked: true,
    schema: {
      search: { type: 'button', text: 'Search', icon: 'search', iconPos: 'top' },
      update: { type: 'button', text: 'Update', icon: 'redo', iconPos: 'bottom' },
    }
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-icons -->

<!-- #region usage-loading -->

## Loading

Set the `loading` prop to display a loading spinner. It accepts a boolean, a reactive ref, a function, or a conditions array.

::: usage center nomodel

```vue [Preview]
<VfButton name="submit" :loading />
```

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

const handleClick = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 1500)
}
</script>

<template>
  <VfButton
    name="submit"
    text="Loading"
    icon="check"
    :loading
    @click="handleClick"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'
import { ref } from 'vue'

const loading = ref(false)

const schema = defineSchema({
  submit: {
    type: 'button',
    text: 'Loading',
    icon: 'check',
    loading,
    onClick() {
      loading.value = true

      setTimeout(() => {
        loading.value = false
      }, 1500)
    }
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

```vue [Live]
<VfButton
  name="submit"
  text="Loading"
  icon="check"
  :loading
  @click="handleLoadingClick"
/>
```

:::

<!-- #endregion usage-loading -->

<!-- #region usage-links -->

## Links

Use `href` to render the button as an `<a>` element. Set `target` for external links. Use `to` for vue-router navigation.

::: usage center nomodel

```vue [Preview]
<VfButton name="link" href="#usage.links" />
<VfButton name="external" href="https://vuejs.org" target="_blank" />
<VfButton name="router" to="/" />
```

```vue [Template]
<VfGroup name="links" stacked>
  <VfButton
    name="link"
    text="Link"
    variant="link"
    href="#usage.links"
  />
  <VfButton
    name="external"
    text="External"
    icon="arrow-up-right-from-square"
    icon-pos="right"
    href="https://vuejs.org"
    target="_blank"
  />
  <VfButton name="router" text="Router" to="/" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  links: {
    type: 'group',
    stacked: true,
    schema: {
      link: {
        type: 'button',
        text: 'Link',
        variant: 'link',
        href: '#usage.links',
      },
      external: {
        type: 'button',
        text: 'External',
        icon: 'arrow-up-right-from-square',
        iconPos: 'right',
        href: 'https://vuejs.org',
        target: '_blank',
      },
      router: {
        type: 'button',
        text: 'Router',
        to: '/',
      },
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-links -->

<!-- #region usage-severities -->

## Severities

The `severity` prop controls the button's color. Available values are `'primary'`, `'secondary'` (default), `'success'`, `'info'`, `'warn'`, `'help'`, `'danger'`, and `'contrast'`.

::: usage center nomodel w-480

```vue [Preview]
<VfButton name="primary" severity="primary" />
<VfButton name="secondary" severity="secondary" />
<VfButton name="success" severity="success" />
<VfButton name="info" severity="info" />
<VfButton name="warn" severity="warn" />
<VfButton name="help" severity="help" />
<VfButton name="danger" severity="danger" />
<VfButton name="contrast" severity="contrast" />
```

```vue [Template]
<VfGroup name="severities" stacked>
  <VfButton name="primary" text="Primary" severity="primary" />
  <VfButton name="secondary" text="Secondary" severity="secondary" />
  <VfButton name="success" text="Success" severity="success" />
  <VfButton name="info" text="Info" severity="info" />
  <VfButton name="warn" text="Warn" severity="warn" />
  <VfButton name="help" text="Help" severity="help" />
  <VfButton name="danger" text="Danger" severity="danger" />
  <VfButton name="contrast" text="Contrast" severity="contrast" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  severities: {
    type: 'group',
    stacked: true,
    schema: {
      primary: { type: 'button', text: 'Primary', severity: 'primary' },
      secondary: { type: 'button', text: 'Secondary', severity: 'secondary' },
      success: { type: 'button', text: 'Success', severity: 'success' },
      info: { type: 'button', text: 'Info', severity: 'info' },
      warn: { type: 'button', text: 'Warn', severity: 'warn' },
      help: { type: 'button', text: 'Help', severity: 'help' },
      danger: { type: 'button', text: 'Danger', severity: 'danger' },
      contrast: { type: 'button', text: 'Contrast', severity: 'contrast' },
    }
  }
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-severities -->

<!-- #region usage-disabled -->

## Disabled

The `disabled` prop prevents interaction. It works with all severity and variant combinations. It also accepts [conditions](/guide/conditions#conditional-props).

::: usage center nomodel w-480

```vue [Preview]
<VfButton name="primary" severity="primary" disabled />
<VfButton name="secondary" severity="secondary" disabled />
<VfButton name="success" severity="success" disabled />
<VfButton name="info" severity="info" disabled />
<VfButton name="warn" severity="warn" disabled />
<VfButton name="help" severity="help" disabled />
<VfButton name="danger" severity="danger" disabled />
<VfButton name="contrast" severity="contrast" disabled />
```

```vue [Template]
<VfGroup name="disableds" stacked disabled>
  <VfButton name="primary" text="Primary" severity="primary" />
  <VfButton name="secondary" text="Secondary" severity="secondary" />
  <VfButton name="success" text="Success" severity="success" />
  <VfButton name="info" text="Info" severity="info" />
  <VfButton name="warn" text="Warn" severity="warn" />
  <VfButton name="help" text="Help" severity="help" />
  <VfButton name="danger" text="Danger" severity="danger" />
  <VfButton name="contrast" text="Contrast" severity="contrast" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  disableds: {
    type: 'group',
    stacked: true,
    schema: {
      primary: {type: 'button', text: 'Primary', severity: 'primary', disabled: true },
      secondary: {type: 'button', text: 'Secondary', severity: 'secondary', disabled: true },
      success: {type: 'button', text: 'Success', severity: 'success', disabled: true },
      info: {type: 'button', text: 'Info', severity: 'info', disabled: true },
      warn: {type: 'button', text: 'Warn', severity: 'warn', disabled: true },
      help: {type: 'button', text: 'Help', severity: 'help', disabled: true },
      danger: {type: 'button', text: 'Danger', severity: 'danger', disabled: true },
      contrast: {type: 'button', text: 'Contrast', severity: 'contrast', disabled: true },
    }
  }
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-disabled -->

<!-- #region usage-outlined-variant -->

## Outlined Variant

The `'outlined'` variant renders the button with a border and transparent background that fills on hover.

::: usage center nomodel w-480

```vue [Preview]
<VfButton name="primary" severity="primary" variant="outlined" />
<VfButton name="secondary" severity="secondary" variant="outlined" />
<VfButton name="success" severity="success" variant="outlined" />
<VfButton name="info" severity="info" variant="outlined" />
<VfButton name="warn" severity="warn" variant="outlined" />
<VfButton name="help" severity="help" variant="outlined" />
<VfButton name="danger" severity="danger" variant="outlined" />
<VfButton name="contrast" severity="contrast" variant="outlined" />
```

```vue [Template]
<VfGroup name="outlineds" stacked>
  <VfButton name="primary" text="Primary" severity="primary" variant="outlined" />
  <VfButton name="secondary" text="Secondary" severity="secondary" variant="outlined" />
  <VfButton name="success" text="Success" severity="success" variant="outlined" />
  <VfButton name="info" text="Info" severity="info" variant="outlined" />
  <VfButton name="warn" text="Warn" severity="warn" variant="outlined" />
  <VfButton name="help" text="Help" severity="help" variant="outlined" />
  <VfButton name="danger" text="Danger" severity="danger" variant="outlined" />
  <VfButton name="contrast" text="Contrast" severity="contrast" variant="outlined" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  outlineds: {
    type: 'group',
    stacked: true,
    schema: {
      primary: { type: 'button', text: 'Primary', severity: 'primary', variant: 'outlined' },
      secondary: { type: 'button', text: 'Secondary', severity: 'secondary', variant: 'outlined' },
      success: { type: 'button', text: 'Success', severity: 'success', variant: 'outlined' },
      info: { type: 'button', text: 'Info', severity: 'info', variant: 'outlined' },
      warn: { type: 'button', text: 'Warn', severity: 'warn', variant: 'outlined' },
      help: { type: 'button', text: 'Help', severity: 'help', variant: 'outlined' },
      danger: { type: 'button', text: 'Danger', severity: 'danger', variant: 'outlined' },
      contrast: { type: 'button', text: 'Contrast', severity: 'contrast', variant: 'outlined' },
    }
  }
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-outlined-variant -->

<!-- #region usage-text-variant -->

## Text Variant

The `'text'` variant renders the button without a background, showing only the label with the severity color.

::: usage center nomodel w-480

```vue [Preview]
<VfButton name="primary" severity="primary" variant="text" />
<VfButton name="secondary" severity="secondary" variant="text" />
<VfButton name="success" severity="success" variant="text" />
<VfButton name="info" severity="info" variant="text" />
<VfButton name="warn" severity="warn" variant="text" />
<VfButton name="help" severity="help" variant="text" />
<VfButton name="danger" severity="danger" variant="text" />
<VfButton name="contrast" severity="contrast" variant="text" />
```

```vue [Template]
<VfGroup name="texts" stacked>
  <VfButton name="primary" text="Primary" severity="primary" variant="text" />
  <VfButton name="secondary" text="Secondary" severity="secondary" variant="text" />
  <VfButton name="success" text="Success" severity="success" variant="text" />
  <VfButton name="info" text="Info" severity="info" variant="text" />
  <VfButton name="warn" text="Warn" severity="warn" variant="text" />
  <VfButton name="help" text="Help" severity="help" variant="text" />
  <VfButton name="danger" text="Danger" severity="danger" variant="text" />
  <VfButton name="contrast" text="Contrast" severity="contrast" variant="text" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  actions: {
    type: 'group',
    stacked: true,
    schema: {
      primary: { type: 'button', text: 'Primary', severity: 'primary', variant: 'text' },
      secondary: { type: 'button', text: 'Secondary', severity: 'secondary', variant: 'text' },
      success: { type: 'button', text: 'Success', severity: 'success', variant: 'text' },
      info: { type: 'button', text: 'Info', severity: 'info', variant: 'text' },
      warn: { type: 'button', text: 'Warn', severity: 'warn', variant: 'text' },
      help: { type: 'button', text: 'Help', severity: 'help', variant: 'text' },
      danger: { type: 'button', text: 'Danger', severity: 'danger', variant: 'text' },
      contrast: { type: 'button', text: 'Contrast', severity: 'contrast', variant: 'text' },
    }
  }
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-text-variant -->

<!-- #region usage-icon-only -->

## Icon Only

Icon-only buttons combine `icon` with a `variant` and `severity` for compact action buttons. The example below shows all severity and variant combinations in both medium and small sizes.

::: usage center nomodel w-480

```vue [Preview]
<VfButton name="primary" icon="check" severity="primary" />
<VfButton name="secondary" icon="bookmark" severity="secondary" />
<VfButton name="success" icon="search" severity="success" />
<VfButton name="info" icon="user" severity="info" />
<VfButton name="warn" icon="bell" severity="warn" />
<VfButton name="help" icon="heart" severity="help" />
<VfButton name="danger" icon="times" severity="danger" />
<VfButton name="contrast" icon="star" severity="contrast" />

<VfButton name="primary" icon="check" severity="primary" variant="outlined" />
<VfButton name="secondary" icon="bookmark" severity="secondary" variant="outlined" />
<VfButton name="success" icon="search" severity="success" variant="outlined" />
<VfButton name="info" icon="user" severity="info" variant="outlined" />
<VfButton name="warn" icon="bell" severity="warn" variant="outlined" />
<VfButton name="help" icon="heart" severity="help" variant="outlined" />
<VfButton name="danger" icon="times" severity="danger" variant="outlined" />
<VfButton name="contrast" icon="star" severity="contrast" variant="outlined" />

<VfButton name="primary" icon="check" severity="primary" variant="text" />
<VfButton name="secondary" icon="bookmark" severity="secondary" variant="text" />
<VfButton name="success" icon="search" severity="success" variant="text" />
<VfButton name="info" icon="user" severity="info" variant="text" />
<VfButton name="warn" icon="bell" severity="warn" variant="text" />
<VfButton name="help" icon="heart" severity="help" variant="text" />
<VfButton name="danger" icon="times" severity="danger" variant="text" />
<VfButton name="contrast" icon="star" severity="contrast" variant="text" />
```

```vue [Template]
<VfGroup name="iconOnly" tabbed>
  <VfGroup name="medium" page="Medium">
    <VfGroup name="filled" stacked>
      <VfButton name="primary" icon="check" severity="primary" />
      <VfButton name="secondary" icon="bookmark" severity="secondary" />
      <VfButton name="success" icon="search" severity="success" />
      <VfButton name="info" icon="user" severity="info" />
      <VfButton name="warn" icon="bell" severity="warn" />
      <VfButton name="help" icon="heart" severity="help" />
      <VfButton name="danger" icon="times" severity="danger" />
      <VfButton name="contrast" icon="star" severity="contrast" />
    </VfGroup>
    <VfGroup name="outlined" stacked>
      <VfButton name="primary" icon="check" severity="primary" variant="outlined" />
      <VfButton name="secondary" icon="bookmark" severity="secondary" variant="outlined" />
      <VfButton name="success" icon="search" severity="success" variant="outlined" />
      <VfButton name="info" icon="user" severity="info" variant="outlined" />
      <VfButton name="warn" icon="bell" severity="warn" variant="outlined" />
      <VfButton name="help" icon="heart" severity="help" variant="outlined" />
      <VfButton name="danger" icon="times" severity="danger" variant="outlined" />
      <VfButton name="contrast" icon="star" severity="contrast" variant="outlined" />
    </VfGroup>
    <VfGroup name="text" stacked>
      <VfButton name="primary" icon="check" severity="primary" variant="text" />
      <VfButton name="secondary" icon="bookmark" severity="secondary" variant="text" />
      <VfButton name="success" icon="search" severity="success" variant="text" />
      <VfButton name="info" icon="user" severity="info" variant="text" />
      <VfButton name="warn" icon="bell" severity="warn" variant="text" />
      <VfButton name="help" icon="heart" severity="help" variant="text" />
      <VfButton name="danger" icon="times" severity="danger" variant="text" />
      <VfButton name="contrast" icon="star" severity="contrast" variant="text" />
    </VfGroup>
  </VfGroup>
  <VfGroup name="small" page="Small">
    <VfGroup name="filled" stacked>
      <VfButton name="primary" icon="check" severity="primary" size="small" />
      <VfButton name="secondary" icon="bookmark" severity="secondary" size="small" />
      <VfButton name="success" icon="search" severity="success" size="small" />
      <VfButton name="info" icon="user" severity="info" size="small" />
      <VfButton name="warn" icon="bell" severity="warn" size="small" />
      <VfButton name="help" icon="heart" severity="help" size="small" />
      <VfButton name="danger" icon="times" severity="danger" size="small" />
      <VfButton name="contrast" icon="star" severity="contrast" size="small" />
    </VfGroup>
    <VfGroup name="outlined" stacked>
      <VfButton name="primary" icon="check" severity="primary" size="small" variant="outlined" />
      <VfButton name="secondary" icon="bookmark" severity="secondary" size="small" variant="outlined" />
      <VfButton name="success" icon="search" severity="success" size="small" variant="outlined" />
      <VfButton name="info" icon="user" severity="info" size="small" variant="outlined" />
      <VfButton name="warn" icon="bell" severity="warn" size="small" variant="outlined" />
      <VfButton name="help" icon="heart" severity="help" size="small" variant="outlined" />
      <VfButton name="danger" icon="times" severity="danger" size="small" variant="outlined" />
      <VfButton name="contrast" icon="star" severity="contrast" size="small" variant="outlined" />
    </VfGroup>
    <VfGroup name="text" stacked>
      <VfButton name="primary" icon="check" severity="primary" size="small" variant="text" />
      <VfButton name="secondary" icon="bookmark" severity="secondary" size="small" variant="text" />
      <VfButton name="success" icon="search" severity="success" size="small" variant="text" />
      <VfButton name="info" icon="user" severity="info" size="small" variant="text" />
      <VfButton name="warn" icon="bell" severity="warn" size="small" variant="text" />
      <VfButton name="help" icon="heart" severity="help" size="small" variant="text" />
      <VfButton name="danger" icon="times" severity="danger" size="small" variant="text" />
      <VfButton name="contrast" icon="star" severity="contrast" size="small" variant="text" />
    </VfGroup>
  </VfGroup>
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  medium: {
    type: 'group',
    page: 'Medium',
    schema: {
      filled: {
        type: 'group',
        stacked: true,
        schema: {
          primary: { type: 'button', icon: 'check', severity: 'primary' },
          secondary: { type: 'button', icon: 'bookmark', severity: 'secondary' },
          success: { type: 'button', icon: 'search', severity: 'success' },
          info: { type: 'button', icon: 'user', severity: 'info' },
          warn: { type: 'button', icon: 'bell', severity: 'warn' },
          help: { type: 'button', icon: 'heart', severity: 'help' },
          danger: { type: 'button', icon: 'times', severity: 'danger' },
          contrast: { type: 'button', icon: 'star', severity: 'contrast' },
        },
      },
      outlined: {
        type: 'group',
        stacked: true,
        schema: {
          primary: { type: 'button', icon: 'check', severity: 'primary', variant: 'outlined' },
          secondary: { type: 'button', icon: 'bookmark', severity: 'secondary', variant: 'outlined' },
          success: { type: 'button', icon: 'search', severity: 'success', variant: 'outlined' },
          info: { type: 'button', icon: 'user', severity: 'info', variant: 'outlined' },
          warn: { type: 'button', icon: 'bell', severity: 'warn', variant: 'outlined' },
          help: { type: 'button', icon: 'heart', severity: 'help', variant: 'outlined' },
          danger: { type: 'button', icon: 'times', severity: 'danger', variant: 'outlined' },
          contrast: { type: 'button', icon: 'star', severity: 'contrast', variant: 'outlined' },
        },
      },
      text: {
        type: 'group',
        stacked: true,
        schema: {
          primary: { type: 'button', icon: 'check', severity: 'primary', variant: 'text' },
          secondary: { type: 'button', icon: 'bookmark', severity: 'secondary', variant: 'text' },
          success: { type: 'button', icon: 'search', severity: 'success', variant: 'text' },
          info: { type: 'button', icon: 'user', severity: 'info', variant: 'text' },
          warn: { type: 'button', icon: 'bell', severity: 'warn', variant: 'text' },
          help: { type: 'button', icon: 'heart', severity: 'help', variant: 'text' },
          danger: { type: 'button', icon: 'times', severity: 'danger', variant: 'text' },
          contrast: { type: 'button', icon: 'star', severity: 'contrast', variant: 'text' },
        },
      },
    },
  },
  small: {
    type: 'group',
    page: 'Small',
    schema: {
      filled: {
        type: 'group',
        stacked: true,
        schema: {
          primary: { type: 'button', icon: 'check', severity: 'primary', size: 'small' },
          secondary: { type: 'button', icon: 'bookmark', severity: 'secondary', size: 'small' },
          success: { type: 'button', icon: 'search', severity: 'success', size: 'small' },
          info: { type: 'button', icon: 'user', severity: 'info', size: 'small' },
          warn: { type: 'button', icon: 'bell', severity: 'warn', size: 'small' },
          help: { type: 'button', icon: 'heart', severity: 'help', size: 'small' },
          danger: { type: 'button', icon: 'times', severity: 'danger', size: 'small' },
          contrast: { type: 'button', icon: 'star', severity: 'contrast', size: 'small' },
        },
      },
      outlined: {
        type: 'group',
        stacked: true,
        schema: {
          primary: { type: 'button', icon: 'check', severity: 'primary', size: 'small', variant: 'outlined' },
          secondary: { type: 'button', icon: 'bookmark', severity: 'secondary', size: 'small', variant: 'outlined' },
          success: { type: 'button', icon: 'search', severity: 'success', size: 'small', variant: 'outlined' },
          info: { type: 'button', icon: 'user', severity: 'info', size: 'small', variant: 'outlined' },
          warn: { type: 'button', icon: 'bell', severity: 'warn', size: 'small', variant: 'outlined' },
          help: { type: 'button', icon: 'heart', severity: 'help', size: 'small', variant: 'outlined' },
          danger: { type: 'button', icon: 'times', severity: 'danger', size: 'small', variant: 'outlined' },
          contrast: { type: 'button', icon: 'star', severity: 'contrast', size: 'small', variant: 'outlined' },
        },
      },
      text: {
        type: 'group',
        stacked: true,
        schema: {
          primary: { type: 'button', icon: 'check', severity: 'primary', size: 'small', variant: 'text' },
          secondary: { type: 'button', icon: 'bookmark', severity: 'secondary', size: 'small', variant: 'text' },
          success: { type: 'button', icon: 'search', severity: 'success', size: 'small', variant: 'text' },
          info: { type: 'button', icon: 'user', severity: 'info', size: 'small', variant: 'text' },
          warn: { type: 'button', icon: 'bell', severity: 'warn', size: 'small', variant: 'text' },
          help: { type: 'button', icon: 'heart', severity: 'help', size: 'small', variant: 'text' },
          danger: { type: 'button', icon: 'times', severity: 'danger', size: 'small', variant: 'text' },
          contrast: { type: 'button', icon: 'star', severity: 'contrast', size: 'small', variant: 'text' },
        },
      },
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-icon-only -->

<!-- #region usage-sizes -->

## Sizes

The `size` prop controls the button's size. Available values are `'medium'` (default) and `'small'`.

::: usage center nomodel

```vue [Preview]
<VfButton name="small" text="Small" icon="check" size="small" />
<VfButton name="medium" text="Medium" icon="check" size="medium" />
```

```vue [Template]
<VfGroup name="sizes" stacked>
  <VfButton
    name="small"
    text="Small"
    icon="check"
    size="small"
  />
  <VfButton
    name="medium"
    text="Medium"
    icon="check"
    size="medium"
  />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  sizes: {
    type: 'group',
    stacked: true,
    schema: {
      small: { type: 'button', text: 'Small', icon: 'check', size: 'small' },
      medium: { type: 'button', text: 'Medium', icon: 'check', size: 'medium' },
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-sizes -->

<!-- #region usage-alignment -->

## Alignment

The `align` prop controls the horizontal alignment of the button within its container. Available values are `'left'` (default), `'center'`, and `'right'`.

::: usage nomodel

```vue [Preview]
<VfButton name="left" text="Left" align="left" />
<VfButton name="center" text="Center" align="center" />
<VfButton name="right" text="Right" align="right" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  left: { type: 'button', text: 'Left', align: 'left' },
  center: { type: 'button', text: 'Center', align: 'center' },
  right: { type: 'button', text: 'Right', align: 'right' },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-alignment -->
<!-- #endregion usage -->
<!-- @endtab -->

<!-- @tab Props -->

## Props

<!-- @props-intro-start -->
Configure the component's behavior and appearance with these props.
<!-- @props-intro-end -->

<!-- @props-start -->
<!-- @collapsible -->

### General {#props-general}

| Prop | Default | Description |
| --- | --- | --- |
| [`name`](!code#props.name "ElementName") | — | **Required.** The element's unique identifier and path in the current level of form data model. |
| [`type`](!code#props.type "string") | `'button'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Element {#props-button}

| Prop | Default | Description |
| --- | --- | --- |
| [`variant`](!code#props.variant "'filled' \| 'outlined' \| 'text' \| 'link'") | `'filled'` | The visual variant of the button. |
| [`severity`](!code#props.severity "DProp<'primary' \| 'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast', TContext>") | `'secondary'` | The color severity of the button. |
| [`size`](!code#props.size "'medium' \| 'small'") | `'medium'` | The size of the button. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | `false` | Whether the element is disabled. |
| [`text`](!code#props.text "TProp<string, TContext>") | — | The label text displayed on the button. |
| [`action`](!code#props.action "'submit' \| 'reset' \| (string & {})") | — | The action performed when the button is clicked. Use `'submit'` to submit the parent form or `'reset'` to reset it. Custom string values can be used for application-specific actions handled via the `click` event. |
| [`icon`](!code#props.icon "DProp<string, TContext>") | — | The icon to display inside the button. |
| [`iconPos`](!code#props.iconPos "'left' \| 'right' \| 'top' \| 'bottom'") | `'left'` | The position of the icon relative to the button label. |
| [`href`](!code#props.href "TProp<string, TContext>") | — | When set the button renders as an `<a>` element instead of `<button>`. |
| [`target`](!code#props.target "string") | — | The `target` attribute for the anchor element. |
| [`rel`](!code#props.rel "string") | — | The `rel` attribute for the anchor element. |
| [`download`](!code#props.download "string \| boolean") | — | The `download` attribute for the anchor element. |
| [`to`](!code#props.to "TProp<string, TContext>") | — | Route location to navigate to when using `vue-router`. |
| [`fluid`](!code#props.fluid "boolean") | `false` | Whether the button spans the full width of its container. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |

### Conditions {#props-conditions}

| Prop | Default | Description |
| --- | --- | --- |
| [`conditions`](!code#props.conditions "ConditionalProp<TContext>") | — | Conditions that control the element's visibility and availability. |
| [`conditionsTrigger`](!code#props.conditionsTrigger "ConditionsTriggerProp<TContext>") | — | The source that triggers re-evaluation of this element's async conditional props (`conditions`, `disabled`, `readonly`, and validation rule conditions). Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, any change in the form model re-triggers evaluation. |
| [`conditionsDebounce`](!code#props.conditionsDebounce "number") | — | The debounce delay in milliseconds applied before re-evaluating this element's async conditional props when the trigger source changes. Overrides the global `$conditions.debounce` config (default `300`). |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`loading`](!code#props.loading "ConditionalProp<TContext>") | `false` | Whether the element is in loading state. |
| [`align`](!code#props.align "'left' \| 'center' \| 'right'") | — | Horizontal alignment of the button within its container. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Customization {#props-customization}

| Prop | Default | Description |
| --- | --- | --- |
| [`parts`](!code#props.parts "P") | — | Custom DOM attribute overrides for the component's structural parts. |
| [`class`](!code#props.class "ClassValue") | — | CSS classes to apply to the component's root element. |
| [`classes`](!code#props.classes "C") | — | Custom CSS class overrides for the component's structural parts. |
| [`reclass`](!code#props.reclass "C") | — | CSS class overrides that replace (rather than merge with) default classes. |
| [`tokens`](!code#props.tokens "ThemeTokens") | — | Token overrides applied to the element's CSS custom properties. |
| [`slots`](!code#props.slots "S") | — | Custom Vue components to use for named slots. Every component resolves it through the standard outlets pipeline (see `useOutlets`). |
| [`presets`](!code#props.presets "PresetsProp") | — | Named configuration presets to apply to the component. |
| [`template`](!code#props.template "ComponentProp \| null") | — | A custom Vue component to use as the template instead of the default. |
| [`component`](!code#props.component "ComponentProp") | — | A custom Vue component to render in the component's default slot. |

<!-- @endcollapsible -->
<!-- @props-end -->

<!-- @props-adapter-start --><!-- @props-adapter-end -->

<!-- @endtab -->
<!-- @tab Context -->

## Context

Reactive properties and methods accessible on the component's [Context](/guide/context) object.

<!-- @collapsible -->
<!-- @context-start -->
### General {#section-general}

| Name | Description |
| --- | --- |
| [`type`](!code#context.type "string") | The element's type identifier (e.g. "text", "checkbox", "select"). |
| [`name`](!code#context.name "string") | The element's name as a string ref. |
| [`props`](!code#context.props "object") | The resolved component props with defaults applied. |

### Button {#section-button}

| Name | Description |
| --- | --- |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`icon`](!code#context.icon "string \| undefined") | The resolved icon CSS class string. `$`-prefixed names are mapped through the config-level semantic `icons` map. |
| [`href`](!code#context.href "string \| (string & {}) \| undefined") | The resolved href for the button, supporting dynamic text props. |
| [`to`](!code#context.to "string \| (string & {}) \| undefined") | The resolved route location for the button, supporting dynamic text props. |
| [`severity`](!code#context.severity "string \| (string & {}) \| undefined") | The resolved severity of the button, supporting dynamic text props. |
| [`handleClick()`](!code#context.handleClick "(event: MouseEvent) => void") | Handles the click event, fires the click event through the event system, and performs the configured action (submit or reset) on the parent form. |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`visible`](!code#context.visible "boolean") | Whether the element is currently visible, based on availability, container visibility, and pager state. |
| [`available`](!code#context.available "boolean") | Whether the element is available (not hidden by conditional logic). |
| [`disabled`](!code#context.disabled "boolean") | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`loading`](!code#context.loading "boolean") | Whether the button is in a loading state. The `loading` prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`enable()`](!code#context.enable "() => void") | Programmatically enables the element. |
| [`disable()`](!code#context.disable "() => void") | Programmatically disables the element. |

### Validation {#section-validation}

| Name | Description |
| --- | --- |
| [`errors`](!code#context.errors "string[]") | The reactive list of validation error messages. |
| [`displayErrors`](!code#context.displayErrors "string[]") | The reactive list of validation error messages. |
| [`messages`](!code#context.messages "string[]") | The reactive list of informational messages. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for managing custom errors, messages, and prepended/appended messages. |
| [`genericName`](!code#context.genericName "string") | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`text`](!code#context.text "string \| (string & {}) \| undefined") | The resolved label text for the button. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`page`](!code#context.page "PageProp \| undefined") | Page metadata for stepped/tabbed forms. |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
| [`tokens`](!code#context.tokens "CSSProperties") | Reactive inline style object with resolved theme token CSS custom properties. |
| [`tokenClass`](!code#context.tokenClass "string") | A unique CSS class scoped to this button instance, used to target the injected token style rule. |
| [`tokenCss`](!code#context.tokenCss "string") | The CSS text for scoped token custom properties on this button instance. |
| [`nonce`](!code#context.nonce "string \| undefined") | Unique security nonce for injecting scoped styles. |
| [`viewLoaded`](!code#context.viewLoaded "boolean") | Whether the element's view has been loaded (used for lazy rendering optimization). |
| [`$el`](!code#context.$el "HTMLElement \| null") | Reference to the component's root DOM element. |
| [`resolvedColumns`](!code#context.resolvedColumns "object") | Resolved column sizes per breakpoint, normalized into container/label/wrapper/group values. |
| [`updateColumns()`](!code#context.updateColumns "(v: any) => any") | Updates the column configuration programmatically. |
| [`scrollTo()`](!code#context.scrollTo "(options: ScrollIntoViewOptions \| undefined, force: boolean \| undefined) => Promise<boolean>") | Scrolls the window to this element. If the element belongs to a step or tab, that page is selected first before scrolling. |
| [`focus()`](!code#context.focus "(scroll: boolean \| undefined) => Promise<boolean>") | Focuses the first focusable HTML element (input, select, textarea, button, etc.) within the wrapper. Optionally scrolls to the element first. |

### Tree {#section-tree}

| Name | Description |
| --- | --- |
| [`form$`](!code#context.form$ "VfFormContext<EntryProps<Record<string, any>>> \| undefined") | The parent form's context, providing access to form-level state and methods. |
| [`path`](!code#context.path "string") | The element's dot-notation path in the form tree (e.g. "user.name"). |
| [`componentName`](!code#context.componentName "keyof ComponentRegistry<Record<string, any>>") | The resolved Vue component name for this element. |
| [`container`](!code#context.container "ContainerContext \| undefined") | The container context providing path, model, and registration methods for child elements. |
| [`children`](!code#context.children "VueformChildren") | The child element registry providing registration, unregistration, and reactive child lists. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | A unique auto-generated identifier for the element. |
| [`helpId`](!code#context.helpId "string") | The DOM id for the element's help text region. |
| [`errorId`](!code#context.errorId "string") | The DOM id for the element's error message region. |
| [`labelId`](!code#context.labelId "string") | The DOM id for the element's label region. |
<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->
<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/events) for details.

<!-- @events-start -->
| Name | Params | Description |
| --- | --- | --- |
| `click` | [`event`](!code#events.click.event "MouseEvent"), [`context$`](!code#events.click.context$ "LooseContext") | Emitted when the button is clicked. |
| `focus` | [`context$`](!code#events.focus.context$ "TContext") | Emitted when the element receives focus. |
| `blur` | [`context$`](!code#events.blur.context$ "TContext") | Emitted when the element loses focus. |
| `beforeMount` | [`context$`](!code#events.beforeMount.context$ "TContext") | Emitted before the component is mounted. |
| `mounted` | [`context$`](!code#events.mounted.context$ "TContext") | Emitted after the component is mounted. |
| `beforeUnmount` | [`context$`](!code#events.beforeUnmount.context$ "TContext") | Emitted before the component is unmounted. |
| `unmounted` | [`context$`](!code#events.unmounted.context$ "TContext") | Emitted after the component is unmounted. |
| `updated` | [`context$`](!code#events.updated.context$ "TContext") | Emitted after the component is updated. |
<!-- @events-end -->

<!-- @endtab -->
<!-- @tab Slots -->

## Slots

Named [Slots](/guide/slots) for replacing parts of the component's rendering.

<!-- @slots-start -->
| Name | Scope | Description |
| --- | --- | --- |
| `template` | [`context`](!code#slot.template.context "TContext") | Slot that replaces the entire component rendering. Receives the full component context as a single `context` prop. |
| `before` | — | Slot for content rendered before the label. |
| `default` | [`text`](!code#slot.default.text "string \| undefined") | Default slot that replaces the button label content. |
| `after` | — | Slot for content rendered after the label. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts
component="VfButton"
:examples="{
default: 'Default',
}"
:schema="{
text: 'Submit',
label: 'Actions',
after: 'a',
help: 'Click to submit your form',
hint: 'All fields must be valid before submitting',
icon: 'check',
onMounted: ({ messageBag }) => {
messageBag.append('Form has validation errors', 'error')
messageBag.append('Form submitted successfully', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfButton
      name="default"
      v-bind="schema"
    />
</template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->
### `button`

The root button or anchor element.

| | |
| --- | --- |
| **Element** | `<button>` `<a>` |
| **Classes** | `.vf-btn` `.vf-filled?` `.vf-outlined?` `.vf-text?` `.vf-link?` `.vf-primary?` `.vf-secondary?` `.vf-success?` `.vf-info?` `.vf-warn?` `.vf-help?` `.vf-danger?` `.vf-contrast?` `.vf-sm?` `.vf-fluid?` `.vf-disabled?` `.vf-loading?` `.vf-left?` `.vf-right?` `.vf-center?` `.vf-icon-only?` |

### `icon`

The icon of the button.

| | |
| --- | --- |
| **Element** | `<i>` |
| **Classes** | `.vf-btn-icon` `.vf-right?` `.vf-top?` `.vf-bottom?` |

### `text`

The text of the button.

| | |
| --- | --- |
| **Element** | `<span>` |
| **Classes** | `.vf-btn-text` |
<!-- @parts-end -->
<!-- @endtab -->

<!-- @tab Tokens -->

## Tokens

All the CSS variables that control this component's appearance with default values in the default theme. See [Theming Guide](/guide/theming-guide#vueform-s-token-system) for details.

<!-- @tokens-start -->
<!-- @subtabs -->
<!-- @subtab CSS -->

```css
:root {
  /**
   * Element tokens
   * -------------------------------------------------------------------------- */
  --vf-btn-gutter-x: 0.5rem;
  --vf-btn-gutter-x-sm: 0.5rem;
  --vf-btn-gutter-y: 0;
  --vf-btn-gutter-y-sm: 0;
  --vf-btn-padding-x: var(--vf-px);
  --vf-btn-padding-x-sm: 0.5rem;
  --vf-btn-padding-y: var(--vf-py);
  --vf-btn-padding-y-sm: 0.125rem;

  --vf-btn-width: auto;

  --vf-btn-font-size: 1rem;
  --vf-btn-font-size-sm: 0.875rem;

  --vf-btn-ring-offset: 1px;
  --vf-btn-ring-style: solid;
  --vf-btn-ring-width: 1px;

  --vf-btn-border-style: solid;
  --vf-btn-border-width: 1px;
  --vf-btn-radius: var(--vf-radius);
  --vf-btn-radius-sm: var(--vf-radius-sm);

  --vf-btn-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);

  --vf-btn-disabled-opacity: 0.6;
  --vf-btn-outline-bg-percent: 15%;
  --vf-btn-outline-transparent-percent: 100%;

  --vf-btn-bg-primary: var(--vf-brand);
  --vf-btn-bg-primary-hover: color-mix(in srgb, var(--vf-brand) 100%, black 15%);
  --vf-btn-border-color-primary: var(--vf-brand);
  --vf-btn-border-color-primary-hover: color-mix(in srgb, var(--vf-brand) 100%, black 15%);
  --vf-btn-color-primary: var(--vf-white);
  --vf-btn-color-primary-hover: var(--vf-white);
  --vf-btn-outline-primary: var(--vf-brand);
  --vf-btn-ring-color-primary: var(--vf-brand);
  --vf-btn-ring-shadow-primary: none;

  --vf-btn-bg-secondary: var(--vf-gray-200);
  --vf-btn-bg-secondary-hover: var(--vf-gray-300);
  --vf-btn-border-color-secondary: var(--vf-gray-200);
  --vf-btn-border-color-secondary-hover: var(--vf-gray-300);
  --vf-btn-color-secondary: var(--vf-gray-700);
  --vf-btn-color-secondary-hover: var(--vf-gray-700);
  --vf-btn-outline-secondary: var(--vf-gray-400);
  --vf-btn-ring-color-secondary: var(--vf-gray-200);
  --vf-btn-ring-shadow-secondary: none;

  --vf-btn-bg-success: var(--vf-green);
  --vf-btn-bg-success-hover: color-mix(in srgb, var(--vf-green) 100%, black 15%);
  --vf-btn-border-color-success: var(--vf-green);
  --vf-btn-border-color-success-hover: color-mix(in srgb, var(--vf-green) 100%, black 15%);
  --vf-btn-color-success: var(--vf-white);
  --vf-btn-color-success-hover: var(--vf-white);
  --vf-btn-outline-success: var(--vf-green);
  --vf-btn-ring-color-success: var(--vf-green);
  --vf-btn-ring-shadow-success: none;

  --vf-btn-bg-info: var(--vf-sky);
  --vf-btn-bg-info-hover: color-mix(in srgb, var(--vf-sky) 100%, black 15%);
  --vf-btn-border-color-info: var(--vf-sky);
  --vf-btn-border-color-info-hover: color-mix(in srgb, var(--vf-sky) 100%, black 15%);
  --vf-btn-color-info: var(--vf-white);
  --vf-btn-color-info-hover: var(--vf-white);
  --vf-btn-outline-info: var(--vf-sky);
  --vf-btn-ring-color-info: var(--vf-sky);
  --vf-btn-ring-shadow-info: none;

  --vf-btn-bg-warn: var(--vf-orange);
  --vf-btn-bg-warn-hover: color-mix(in srgb, var(--vf-orange) 100%, black 15%);
  --vf-btn-border-color-warn: var(--vf-orange);
  --vf-btn-border-color-warn-hover: color-mix(in srgb, var(--vf-orange) 100%, black 15%);
  --vf-btn-color-warn: var(--vf-white);
  --vf-btn-color-warn-hover: var(--vf-white);
  --vf-btn-outline-warn: var(--vf-orange);
  --vf-btn-ring-color-warn: var(--vf-orange);
  --vf-btn-ring-shadow-warn: none;

  --vf-btn-bg-help: var(--vf-purple);
  --vf-btn-bg-help-hover: color-mix(in srgb, var(--vf-purple) 100%, black 15%);
  --vf-btn-border-color-help: var(--vf-purple);
  --vf-btn-border-color-help-hover: color-mix(in srgb, var(--vf-purple) 100%, black 15%);
  --vf-btn-color-help: var(--vf-white);
  --vf-btn-color-help-hover: var(--vf-white);
  --vf-btn-outline-help: var(--vf-purple);
  --vf-btn-ring-color-help: var(--vf-purple);
  --vf-btn-ring-shadow-help: none;

  --vf-btn-bg-danger: var(--vf-red);
  --vf-btn-bg-danger-hover: color-mix(in srgb, var(--vf-red) 100%, black 15%);
  --vf-btn-border-color-danger: var(--vf-red);
  --vf-btn-border-color-danger-hover: color-mix(in srgb, var(--vf-red) 100%, black 15%);
  --vf-btn-color-danger: var(--vf-white);
  --vf-btn-color-danger-hover: var(--vf-white);
  --vf-btn-outline-danger: var(--vf-red);
  --vf-btn-ring-color-danger: var(--vf-red);
  --vf-btn-ring-shadow-danger: none;

  --vf-btn-bg-contrast: var(--vf-gray-900);
  --vf-btn-bg-contrast-hover: var(--vf-gray-800);
  --vf-btn-border-color-contrast: var(--vf-gray-900);
  --vf-btn-border-color-contrast-hover: var(--vf-gray-800);
  --vf-btn-color-contrast: var(--vf-white);
  --vf-btn-color-contrast-hover: var(--vf-white);
  --vf-btn-outline-contrast: var(--vf-gray-900);
  --vf-btn-ring-color-contrast: var(--vf-gray-900);
  --vf-btn-ring-shadow-contrast: none;

  /**
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  --vf-help-bg: transparent;
  --vf-help-border-color: transparent;
  --vf-help-border-style: solid;
  --vf-help-border-width: 0;
  --vf-help-color: var(--vf-text-soft);
  --vf-help-font-size: 0.875rem;
  --vf-help-padding: 0;
  --vf-help-radius: var(--vf-radius);

  --vf-element-line-color: var(--vf-gray-300);

  --vf-label-font-size: 1rem;
  --vf-label-font-weight: 600;
  --vf-label-group-h-padding: calc(var(--vf-py) + var(--vf-border-width-t)) 0 0 0;
  --vf-label-group-v-padding: 0 0 0.375rem 0;

  --vf-required-bg: transparent;
  --vf-required-color: inherit;
  --vf-required-content: '*';
  --vf-required-h: auto;
  --vf-required-icon: none;
  --vf-required-w: auto;

  --vf-description-bg: transparent;
  --vf-description-border-color: transparent;
  --vf-description-border-style: solid;
  --vf-description-border-width: 0;
  --vf-description-color: var(--vf-text-soft);
  --vf-description-font-size: 0.875rem;
  --vf-description-padding: 0;
  --vf-description-radius: var(--vf-radius);

  --vf-errors-bg: transparent;
  --vf-errors-border-color: transparent;
  --vf-errors-border-style: solid;
  --vf-errors-border-width: 0;
  --vf-errors-color: var(--vf-red);
  --vf-errors-font-size: 0.875rem;
  --vf-errors-padding: 0;
  --vf-errors-radius: var(--vf-radius);

  --vf-messages-bg: transparent;
  --vf-messages-border-color: var(--vf-border-success);
  --vf-messages-border-style: solid;
  --vf-messages-border-width: 0;
  --vf-messages-color: var(--vf-green);
  --vf-messages-font-size: 0.875rem;
  --vf-messages-padding: 0;
  --vf-messages-radius: var(--vf-radius);

  --vf-element-group-gutter-x: 0;
  --vf-element-group-gutter-y: 0.25rem;
  --vf-element-wrapper-padding: 0;

  /**
   * Semantic tokens
   * -------------------------------------------------------------------------- */
  --vf-icon-height: 0.75rem;
  --vf-icon-width: 0.75rem;

  /**
   * Primitives tokens
   * -------------------------------------------------------------------------- */
  --vf-icon-loading: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6.5' fill='none' stroke='currentColor' stroke-width='1.5' stroke-dasharray='30.6 10.2' stroke-linecap='round'/%3E%3C/svg%3E");

  --vf-space-1: 1rem;
  --vf-space-2: 2rem;
  --vf-space-3: 3rem;
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Element tokens
   * -------------------------------------------------------------------------- */
  btnGutterX: '0.5rem',
  btnGutterXSm: '0.5rem',
  btnGutterY: '0',
  btnGutterYSm: '0',
  btnPaddingX: '$px',
  btnPaddingXSm: '0.5rem',
  btnPaddingY: '$py',
  btnPaddingYSm: '0.125rem',

  btnWidth: 'auto',

  btnFontSize: '1rem',
  btnFontSizeSm: '0.875rem',

  btnRingOffset: '1px',
  btnRingStyle: 'solid',
  btnRingWidth: '1px',

  btnBorderStyle: 'solid',
  btnBorderWidth: '1px',
  btnRadius: '$radius',
  btnRadiusSm: '$radiusSm',

  btnShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',

  btnDisabledOpacity: '0.6',
  btnOutlineBgPercent: '15%',
  btnOutlineTransparentPercent: '100%',

  btnBgPrimary: '$brand',
  btnBgPrimaryHover: 'color-mix(in srgb, $brand 100%, black 15%)',
  btnBorderColorPrimary: '$brand',
  btnBorderColorPrimaryHover: 'color-mix(in srgb, $brand 100%, black 15%)',
  btnColorPrimary: '$white',
  btnColorPrimaryHover: '$white',
  btnOutlinePrimary: '$brand',
  btnRingColorPrimary: '$brand',
  btnRingShadowPrimary: 'none',

  btnBgSecondary: '$gray200',
  btnBgSecondaryHover: '$gray300',
  btnBorderColorSecondary: '$gray200',
  btnBorderColorSecondaryHover: '$gray300',
  btnColorSecondary: '$gray700',
  btnColorSecondaryHover: '$gray700',
  btnOutlineSecondary: '$gray400',
  btnRingColorSecondary: '$gray200',
  btnRingShadowSecondary: 'none',

  btnBgSuccess: '$green',
  btnBgSuccessHover: 'color-mix(in srgb, $green 100%, black 15%)',
  btnBorderColorSuccess: '$green',
  btnBorderColorSuccessHover: 'color-mix(in srgb, $green 100%, black 15%)',
  btnColorSuccess: '$white',
  btnColorSuccessHover: '$white',
  btnOutlineSuccess: '$green',
  btnRingColorSuccess: '$green',
  btnRingShadowSuccess: 'none',

  btnBgInfo: '$sky',
  btnBgInfoHover: 'color-mix(in srgb, $sky 100%, black 15%)',
  btnBorderColorInfo: '$sky',
  btnBorderColorInfoHover: 'color-mix(in srgb, $sky 100%, black 15%)',
  btnColorInfo: '$white',
  btnColorInfoHover: '$white',
  btnOutlineInfo: '$sky',
  btnRingColorInfo: '$sky',
  btnRingShadowInfo: 'none',

  btnBgWarn: '$orange',
  btnBgWarnHover: 'color-mix(in srgb, $orange 100%, black 15%)',
  btnBorderColorWarn: '$orange',
  btnBorderColorWarnHover: 'color-mix(in srgb, $orange 100%, black 15%)',
  btnColorWarn: '$white',
  btnColorWarnHover: '$white',
  btnOutlineWarn: '$orange',
  btnRingColorWarn: '$orange',
  btnRingShadowWarn: 'none',

  btnBgHelp: '$purple',
  btnBgHelpHover: 'color-mix(in srgb, $purple 100%, black 15%)',
  btnBorderColorHelp: '$purple',
  btnBorderColorHelpHover: 'color-mix(in srgb, $purple 100%, black 15%)',
  btnColorHelp: '$white',
  btnColorHelpHover: '$white',
  btnOutlineHelp: '$purple',
  btnRingColorHelp: '$purple',
  btnRingShadowHelp: 'none',

  btnBgDanger: '$red',
  btnBgDangerHover: 'color-mix(in srgb, $red 100%, black 15%)',
  btnBorderColorDanger: '$red',
  btnBorderColorDangerHover: 'color-mix(in srgb, $red 100%, black 15%)',
  btnColorDanger: '$white',
  btnColorDangerHover: '$white',
  btnOutlineDanger: '$red',
  btnRingColorDanger: '$red',
  btnRingShadowDanger: 'none',

  btnBgContrast: '$gray900',
  btnBgContrastHover: '$gray800',
  btnBorderColorContrast: '$gray900',
  btnBorderColorContrastHover: '$gray800',
  btnColorContrast: '$white',
  btnColorContrastHover: '$white',
  btnOutlineContrast: '$gray900',
  btnRingColorContrast: '$gray900',
  btnRingShadowContrast: 'none',

  /**
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  helpBg: 'transparent',
  helpBorderColor: 'transparent',
  helpBorderStyle: 'solid',
  helpBorderWidth: '0',
  helpColor: '$textSoft',
  helpFontSize: '0.875rem',
  helpPadding: '0',
  helpRadius: '$radius',

  elementLineColor: '$gray300',

  labelFontSize: '1rem',
  labelFontWeight: '600',
  labelGroupHPadding: 'calc($py + $borderWidthT) 0 0 0',
  labelGroupVPadding: '0 0 0.375rem 0',

  requiredBg: 'transparent',
  requiredColor: 'inherit',
  requiredContent: "'*'",
  requiredH: 'auto',
  requiredIcon: 'none',
  requiredW: 'auto',

  descriptionBg: 'transparent',
  descriptionBorderColor: 'transparent',
  descriptionBorderStyle: 'solid',
  descriptionBorderWidth: '0',
  descriptionColor: '$textSoft',
  descriptionFontSize: '0.875rem',
  descriptionPadding: '0',
  descriptionRadius: '$radius',

  errorsBg: 'transparent',
  errorsBorderColor: 'transparent',
  errorsBorderStyle: 'solid',
  errorsBorderWidth: '0',
  errorsColor: '$red',
  errorsFontSize: '0.875rem',
  errorsPadding: '0',
  errorsRadius: '$radius',

  messagesBg: 'transparent',
  messagesBorderColor: '$borderSuccess',
  messagesBorderStyle: 'solid',
  messagesBorderWidth: '0',
  messagesColor: '$green',
  messagesFontSize: '0.875rem',
  messagesPadding: '0',
  messagesRadius: '$radius',

  elementGroupGutterX: '0',
  elementGroupGutterY: '0.25rem',
  elementWrapperPadding: '0',

  /**
   * Semantic tokens
   * -------------------------------------------------------------------------- */
  iconHeight: '0.75rem',
  iconWidth: '0.75rem',

  /**
   * Primitives tokens
   * -------------------------------------------------------------------------- */
  iconLoading: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6.5' fill='none' stroke='currentColor' stroke-width='1.5' stroke-dasharray='30.6 10.2' stroke-linecap='round'/%3E%3C/svg%3E\")",

  space1: '1rem',
  space2: '2rem',
  space3: '3rem',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->

<!-- @endtab -->

<!-- @endtabs -->
