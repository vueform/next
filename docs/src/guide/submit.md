---
outline: [2,3]
---

# Submit

A form submission is an HTTP request wrapped in guarantees. The data is valid before it leaves, the response is classified when it comes back, and the form reacts to each outcome — errors appear, values update, the user moves on — without hand-written glue. Vueform ships this entire round trip, and every stage of it can be observed, reconfigured, or replaced.

## A Form That Submits

The smallest submitting form is a schema, an `endpoint`, and a button whose `action` is `'submit'`:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email', rules: 'required|email' },
  plan: { type: 'select', label: 'Plan', items: ['free', 'pro'] },
  save: { type: 'button', text: 'Save', action: 'submit' },
})

const [MyForm] = useForm({ schema, endpoint: '/api/register' })
```

```vue [Template]
<VfForm endpoint="/api/register">
  <VfText name="email" label="Email" rules="required|email" />
  <VfSelect name="plan" label="Plan" :items="['free', 'pro']" />
  <VfButton name="save" text="Save" action="submit" />
</VfForm>
```

:::

Clicking **Save** runs a complete submission, and three guarantees come with it:

- The form [validates](/guide/validation) first. An invalid form never reaches the network — instead, the first invalid element is scrolled into view and focused.
- The data is collected into a payload and sent to the endpoint as a `POST` request.
- The response is classified as success, invalid, or fail, and the matching event fires on the form.

The request method defaults to `POST` and can be changed with the `method` prop:

```vue
<VfForm endpoint="/api/users/1" method="PUT" />
```

Buttons know one other built-in action — `action: 'reset'` restores the form instead of submitting it. Every other `action` string is left to the application and surfaces through the button's `click` event.
