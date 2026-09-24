<script setup lang="ts">
import { defineSchema, defineSlot } from '@vueform/primevue'
import { Tooltip } from 'primevue'
import { h, withDirectives } from 'vue'

const basic = defineSchema({
  base: {
    type: 'input-text',
  },
  vLabel: {
    type: 'input-text',
    label: 'Vertical label',
  },
  hLabel: {
    type: 'input-text',
    label: 'Horizontal label',
    columns: { label: 6 },
  },
  help: {
    type: 'input-text',
    help: 'Help',
  },
  placeholder: {
    type: 'input-text',
    placeholder: 'Placeholder',
  },
  ifta: {
    type: 'input-text',
    ifta: 'Ifta',
  },
  floatLabelEmpty: {
    type: 'input-text',
    floatLabel: 'Float label empty',
  },
  floatLabelFilled: {
    type: 'input-text',
    floatLabel: 'Float label filled',
    defaultValue: 'Value',
  },
  info: {
    type: 'input-text',
    label: 'Info',
    info: 'Info',
  },
  required: {
    type: 'input-text',
    label: 'Required',
    rules: 'required',
  },
  addonBefore: {
    type: 'input-text',
    addonBefore: 'Addon before',
  },
  addonAfter: {
    type: 'input-text',
    addonAfter: 'Addon after',
  },
  addonIconBefore: {
    type: 'input-text',
    addonIconBefore: 'pi pi-search',
  },
  addonIconAfter: {
    type: 'input-text',
    addonIconAfter: 'pi pi-lock',
  },
  iconBefore: {
    type: 'input-text',
    iconBefore: 'pi pi-search',
  },
  iconAfter: {
    type: 'input-text',
    iconAfter: 'pi pi-lock',
  },
  iconContentBefore: {
    type: 'input-text',
    iconContentBefore: 'ICB',
  },
  iconContentAfter: {
    type: 'input-text',
    iconContentAfter: 'ICA',
  },
  addonsAndIfta: {
    type: 'input-text',
    ifta: 'Addons and ifta',
    addonBefore: 'Addon before',
    addonAfter: 'Addon after',
  },
  addonsAndFloatLabelEmpty: {
    type: 'input-text',
    floatLabel: 'Addons and float label empty',
    addonBefore: 'Addon before',
    addonAfter: 'Addon after',
  },
  addonsAndFloatLabelFilled: {
    type: 'input-text',
    floatLabel: 'Addons and float label filled',
    addonBefore: 'Addon before',
    addonAfter: 'Addon after',
    defaultValue: 'Value',
  },
  iconsAndIfta: {
    type: 'input-text',
    ifta: 'Icons and ifta',
    iconBefore: 'pi pi-search',
    iconAfter: 'pi pi-lock',
  },
  iconsAndFloatLabelEmpty: {
    type: 'input-text',
    floatLabel: 'Addons and float label empty',
    iconBefore: 'pi pi-search',
    iconAfter: 'pi pi-lock',
  },
  iconsAndFloatLabelFilled: {
    type: 'input-text',
    floatLabel: 'Addons and float label filled',
    iconBefore: 'pi pi-search',
    iconAfter: 'pi pi-lock',
    defaultValue: 'Value',
  },
})

const slots = defineSchema({
  label: {
    type: 'input-text',
    slots: {
      label: defineSlot('VfInputText.label', {
        setup() {
          return () => h('span', 'Label via slot')
        },
      }),
    },
  },
  info: {
    type: 'input-text',
    label: 'Info via slot',
    slots: {
      info: defineSlot('VfInputText.info', {
        setup() {
          return () =>
            withDirectives(
              h('span', {
                class: 'pi pi-info-circle vf-info-icon',
              }),
              [
                [
                  Tooltip,
                  {
                    value: 'Info via slot',
                    autoHide: false,
                  },
                  '',
                  { ['right']: true },
                ],
              ]
            )
        },
      }),
    },
  },
  floatLabel: {
    type: 'input-text',
    slots: {
      'float-label': defineSlot('VfInputText.floatLabel', {
        setup() {
          return () => h('span', 'Float label via slot')
        },
      }),
    },
  },
  ifta: {
    type: 'input-text',
    slots: {
      ifta: defineSlot('VfInputText.ifta', {
        setup() {
          return () => h('span', 'Ifta via slot')
        },
      }),
    },
  },
  required: {
    type: 'input-text',
    label: 'Required via slot',
    rules: 'required',
    slots: {
      required: defineSlot('VfInputText.required', {
        setup() {
          return () => h('span', '#')
        },
      }),
    },
  },
  addonBefore: {
    type: 'input-text',
    slots: {
      'addon-before': defineSlot('VfInputText.addonBefore', {
        setup() {
          return () => h('span', 'Addon before via slot')
        },
      }),
    },
  },
  addonAfter: {
    type: 'input-text',
    slots: {
      'addon-after': defineSlot('VfInputText.addonAfter', {
        setup() {
          return () => h('span', 'Addon after via slot')
        },
      }),
    },
  },
  addonIconBefore: {
    type: 'input-text',
    slots: {
      'addon-before': defineSlot('VfInputText.addonBefore', {
        setup() {
          return () => h('i', { class: 'pi pi-search' })
        },
      }),
    },
  },
  addonIconAfter: {
    type: 'input-text',
    slots: {
      'addon-after': defineSlot('VfInputText.addonAfter', {
        setup() {
          return () => h('i', { class: 'pi pi-lock' })
        },
      }),
    },
  },
})
</script>

<template>
  <div class="container">
    <div style="width: 400px">
      <h2>Basic Examples</h2>
      <VfForm :schema="basic" />
    </div>
    <div style="width: 400px">
      <h2>Using Slots Prop</h2>
      <VfForm :schema="slots" />
    </div>
    <div style="width: 400px">
      <h2>Using Inline Slots</h2>
      <VfForm>
        <VfInputText name="label">
          <template #label> Label via inline slot </template>
        </VfInputText>
        <VfInputText name="info" label="Info via inline slot">
          <template #info>
            <span
              v-tooltip="{
                value: 'Info via inline slot',
                autoHide: false,
              }"
              class="pi pi-info-circle vf-info-icon"
            />
          </template>
        </VfInputText>
        <VfInputText name="float-label">
          <template #floatLabel> Float label via inline slot </template>
        </VfInputText>
        <VfInputText name="ifta">
          <template #ifta> Ifta via inline slot </template>
        </VfInputText>
        <VfInputText
          name="required"
          label="Required via inline slot"
          rules="required"
        >
          <template #required> # </template>
        </VfInputText>
        <VfInputText name="addon-before">
          <template #addonBefore> Addon before via inline slot </template>
        </VfInputText>
        <VfInputText name="addon-after">
          <template #addonAfter> Addon after via inline slot </template>
        </VfInputText>
        <VfInputText name="icon-before">
          <template #iconBefore><i class="pi pi-search" /></template>
        </VfInputText>
        <VfInputText name="icon-after">
          <template #iconAfter><i class="pi pi-lock" /></template>
        </VfInputText>
      </VfForm>
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  gap: 2rem;
}
</style>
