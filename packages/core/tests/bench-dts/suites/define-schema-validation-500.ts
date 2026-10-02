/*
 * TS performance fixture: the define-schema-500 schema with a Standard Schema
 * second argument whose input type declares all 500 (flattened) leaf
 * keys, forcing MatchesSchemaModel to strip and compare every key on top of
 * the regular schema validation.
 *
 * Measure:
 *   pnpm test:bench-dts define-schema-validation-500
 */
import { defineSchema, type StandardSchemaV1 } from '@vueform/core'
import '@vueform/core/components'

type Input = {
  g00_00_e00: string
  g00_00_e01: string
  g00_00_e02: string
  g00_00_e03: string
  g00_00_e04: string
  g00_00_e05: string
  g00_00_e06: string
  g00_00_e07: string
  g00_00_e08: string
  g00_00_e09: string
  g01_00_e00: string
  g01_00_e01: string
  g01_00_e02: string
  g01_00_e03: string
  g01_00_e04: string
  g01_00_e05: string
  g01_00_e06: string
  g01_00_e07: string
  g01_00_e08: string
  g01_00_e09: string
  g02_00_e00: string
  g02_00_e01: string
  g02_00_e02: string
  g02_00_e03: string
  g02_00_e04: string
  g02_00_e05: string
  g02_00_e06: string
  g02_00_e07: string
  g02_00_e08: string
  g02_00_e09: string
  g03_00_e00: string
  g03_00_e01: string
  g03_00_e02: string
  g03_00_e03: string
  g03_00_e04: string
  g03_00_e05: string
  g03_00_e06: string
  g03_00_e07: string
  g03_00_e08: string
  g03_00_e09: string
  g04_00_e00: string
  g04_00_e01: string
  g04_00_e02: string
  g04_00_e03: string
  g04_00_e04: string
  g04_00_e05: string
  g04_00_e06: string
  g04_00_e07: string
  g04_00_e08: string
  g04_00_e09: string
  g05_00_e00: string
  g05_00_e01: string
  g05_00_e02: string
  g05_00_e03: string
  g05_00_e04: string
  g05_00_e05: string
  g05_00_e06: string
  g05_00_e07: string
  g05_00_e08: string
  g05_00_e09: string
  g06_00_e00: string
  g06_00_e01: string
  g06_00_e02: string
  g06_00_e03: string
  g06_00_e04: string
  g06_00_e05: string
  g06_00_e06: string
  g06_00_e07: string
  g06_00_e08: string
  g06_00_e09: string
  g07_00_e00: string
  g07_00_e01: string
  g07_00_e02: string
  g07_00_e03: string
  g07_00_e04: string
  g07_00_e05: string
  g07_00_e06: string
  g07_00_e07: string
  g07_00_e08: string
  g07_00_e09: string
  g08_00_e00: string
  g08_00_e01: string
  g08_00_e02: string
  g08_00_e03: string
  g08_00_e04: string
  g08_00_e05: string
  g08_00_e06: string
  g08_00_e07: string
  g08_00_e08: string
  g08_00_e09: string
  g09_00_e00: string
  g09_00_e01: string
  g09_00_e02: string
  g09_00_e03: string
  g09_00_e04: string
  g09_00_e05: string
  g09_00_e06: string
  g09_00_e07: string
  g09_00_e08: string
  g09_00_e09: string
  g10_00_e00: string
  g10_00_e01: string
  g10_00_e02: string
  g10_00_e03: string
  g10_00_e04: string
  g10_00_e05: string
  g10_00_e06: string
  g10_00_e07: string
  g10_00_e08: string
  g10_00_e09: string
  g11_00_e00: string
  g11_00_e01: string
  g11_00_e02: string
  g11_00_e03: string
  g11_00_e04: string
  g11_00_e05: string
  g11_00_e06: string
  g11_00_e07: string
  g11_00_e08: string
  g11_00_e09: string
  g12_00_e00: string
  g12_00_e01: string
  g12_00_e02: string
  g12_00_e03: string
  g12_00_e04: string
  g12_00_e05: string
  g12_00_e06: string
  g12_00_e07: string
  g12_00_e08: string
  g12_00_e09: string
  g13_00_e00: string
  g13_00_e01: string
  g13_00_e02: string
  g13_00_e03: string
  g13_00_e04: string
  g13_00_e05: string
  g13_00_e06: string
  g13_00_e07: string
  g13_00_e08: string
  g13_00_e09: string
  g14_00_e00: string
  g14_00_e01: string
  g14_00_e02: string
  g14_00_e03: string
  g14_00_e04: string
  g14_00_e05: string
  g14_00_e06: string
  g14_00_e07: string
  g14_00_e08: string
  g14_00_e09: string
  g15_00_e00: string
  g15_00_e01: string
  g15_00_e02: string
  g15_00_e03: string
  g15_00_e04: string
  g15_00_e05: string
  g15_00_e06: string
  g15_00_e07: string
  g15_00_e08: string
  g15_00_e09: string
  g16_00_e00: string
  g16_00_e01: string
  g16_00_e02: string
  g16_00_e03: string
  g16_00_e04: string
  g16_00_e05: string
  g16_00_e06: string
  g16_00_e07: string
  g16_00_e08: string
  g16_00_e09: string
  g17_00_e00: string
  g17_00_e01: string
  g17_00_e02: string
  g17_00_e03: string
  g17_00_e04: string
  g17_00_e05: string
  g17_00_e06: string
  g17_00_e07: string
  g17_00_e08: string
  g17_00_e09: string
  g18_00_e00: string
  g18_00_e01: string
  g18_00_e02: string
  g18_00_e03: string
  g18_00_e04: string
  g18_00_e05: string
  g18_00_e06: string
  g18_00_e07: string
  g18_00_e08: string
  g18_00_e09: string
  g19_00_e00: string
  g19_00_e01: string
  g19_00_e02: string
  g19_00_e03: string
  g19_00_e04: string
  g19_00_e05: string
  g19_00_e06: string
  g19_00_e07: string
  g19_00_e08: string
  g19_00_e09: string
  g20_00_e00: string
  g20_00_e01: string
  g20_00_e02: string
  g20_00_e03: string
  g20_00_e04: string
  g20_00_e05: string
  g20_00_e06: string
  g20_00_e07: string
  g20_00_e08: string
  g20_00_e09: string
  g21_00_e00: string
  g21_00_e01: string
  g21_00_e02: string
  g21_00_e03: string
  g21_00_e04: string
  g21_00_e05: string
  g21_00_e06: string
  g21_00_e07: string
  g21_00_e08: string
  g21_00_e09: string
  g22_00_e00: string
  g22_00_e01: string
  g22_00_e02: string
  g22_00_e03: string
  g22_00_e04: string
  g22_00_e05: string
  g22_00_e06: string
  g22_00_e07: string
  g22_00_e08: string
  g22_00_e09: string
  g23_00_e00: string
  g23_00_e01: string
  g23_00_e02: string
  g23_00_e03: string
  g23_00_e04: string
  g23_00_e05: string
  g23_00_e06: string
  g23_00_e07: string
  g23_00_e08: string
  g23_00_e09: string
  g24_00_e00: string
  g24_00_e01: string
  g24_00_e02: string
  g24_00_e03: string
  g24_00_e04: string
  g24_00_e05: string
  g24_00_e06: string
  g24_00_e07: string
  g24_00_e08: string
  g24_00_e09: string
  g25_00_e00: string
  g25_00_e01: string
  g25_00_e02: string
  g25_00_e03: string
  g25_00_e04: string
  g25_00_e05: string
  g25_00_e06: string
  g25_00_e07: string
  g25_00_e08: string
  g25_00_e09: string
  g26_00_e00: string
  g26_00_e01: string
  g26_00_e02: string
  g26_00_e03: string
  g26_00_e04: string
  g26_00_e05: string
  g26_00_e06: string
  g26_00_e07: string
  g26_00_e08: string
  g26_00_e09: string
  g27_00_e00: string
  g27_00_e01: string
  g27_00_e02: string
  g27_00_e03: string
  g27_00_e04: string
  g27_00_e05: string
  g27_00_e06: string
  g27_00_e07: string
  g27_00_e08: string
  g27_00_e09: string
  g28_00_e00: string
  g28_00_e01: string
  g28_00_e02: string
  g28_00_e03: string
  g28_00_e04: string
  g28_00_e05: string
  g28_00_e06: string
  g28_00_e07: string
  g28_00_e08: string
  g28_00_e09: string
  g29_00_e00: string
  g29_00_e01: string
  g29_00_e02: string
  g29_00_e03: string
  g29_00_e04: string
  g29_00_e05: string
  g29_00_e06: string
  g29_00_e07: string
  g29_00_e08: string
  g29_00_e09: string
  g30_00_e00: string
  g30_00_e01: string
  g30_00_e02: string
  g30_00_e03: string
  g30_00_e04: string
  g30_00_e05: string
  g30_00_e06: string
  g30_00_e07: string
  g30_00_e08: string
  g30_00_e09: string
  g31_00_e00: string
  g31_00_e01: string
  g31_00_e02: string
  g31_00_e03: string
  g31_00_e04: string
  g31_00_e05: string
  g31_00_e06: string
  g31_00_e07: string
  g31_00_e08: string
  g31_00_e09: string
  g32_00_e00: string
  g32_00_e01: string
  g32_00_e02: string
  g32_00_e03: string
  g32_00_e04: string
  g32_00_e05: string
  g32_00_e06: string
  g32_00_e07: string
  g32_00_e08: string
  g32_00_e09: string
  g33_00_e00: string
  g33_00_e01: string
  g33_00_e02: string
  g33_00_e03: string
  g33_00_e04: string
  g33_00_e05: string
  g33_00_e06: string
  g33_00_e07: string
  g33_00_e08: string
  g33_00_e09: string
  g34_00_e00: string
  g34_00_e01: string
  g34_00_e02: string
  g34_00_e03: string
  g34_00_e04: string
  g34_00_e05: string
  g34_00_e06: string
  g34_00_e07: string
  g34_00_e08: string
  g34_00_e09: string
  g35_00_e00: string
  g35_00_e01: string
  g35_00_e02: string
  g35_00_e03: string
  g35_00_e04: string
  g35_00_e05: string
  g35_00_e06: string
  g35_00_e07: string
  g35_00_e08: string
  g35_00_e09: string
  g36_00_e00: string
  g36_00_e01: string
  g36_00_e02: string
  g36_00_e03: string
  g36_00_e04: string
  g36_00_e05: string
  g36_00_e06: string
  g36_00_e07: string
  g36_00_e08: string
  g36_00_e09: string
  g37_00_e00: string
  g37_00_e01: string
  g37_00_e02: string
  g37_00_e03: string
  g37_00_e04: string
  g37_00_e05: string
  g37_00_e06: string
  g37_00_e07: string
  g37_00_e08: string
  g37_00_e09: string
  g38_00_e00: string
  g38_00_e01: string
  g38_00_e02: string
  g38_00_e03: string
  g38_00_e04: string
  g38_00_e05: string
  g38_00_e06: string
  g38_00_e07: string
  g38_00_e08: string
  g38_00_e09: string
  g39_00_e00: string
  g39_00_e01: string
  g39_00_e02: string
  g39_00_e03: string
  g39_00_e04: string
  g39_00_e05: string
  g39_00_e06: string
  g39_00_e07: string
  g39_00_e08: string
  g39_00_e09: string
  g40_00_e00: string
  g40_00_e01: string
  g40_00_e02: string
  g40_00_e03: string
  g40_00_e04: string
  g40_00_e05: string
  g40_00_e06: string
  g40_00_e07: string
  g40_00_e08: string
  g40_00_e09: string
  g41_00_e00: string
  g41_00_e01: string
  g41_00_e02: string
  g41_00_e03: string
  g41_00_e04: string
  g41_00_e05: string
  g41_00_e06: string
  g41_00_e07: string
  g41_00_e08: string
  g41_00_e09: string
  g42_00_e00: string
  g42_00_e01: string
  g42_00_e02: string
  g42_00_e03: string
  g42_00_e04: string
  g42_00_e05: string
  g42_00_e06: string
  g42_00_e07: string
  g42_00_e08: string
  g42_00_e09: string
  g43_00_e00: string
  g43_00_e01: string
  g43_00_e02: string
  g43_00_e03: string
  g43_00_e04: string
  g43_00_e05: string
  g43_00_e06: string
  g43_00_e07: string
  g43_00_e08: string
  g43_00_e09: string
  g44_00_e00: string
  g44_00_e01: string
  g44_00_e02: string
  g44_00_e03: string
  g44_00_e04: string
  g44_00_e05: string
  g44_00_e06: string
  g44_00_e07: string
  g44_00_e08: string
  g44_00_e09: string
  g45_00_e00: string
  g45_00_e01: string
  g45_00_e02: string
  g45_00_e03: string
  g45_00_e04: string
  g45_00_e05: string
  g45_00_e06: string
  g45_00_e07: string
  g45_00_e08: string
  g45_00_e09: string
  g46_00_e00: string
  g46_00_e01: string
  g46_00_e02: string
  g46_00_e03: string
  g46_00_e04: string
  g46_00_e05: string
  g46_00_e06: string
  g46_00_e07: string
  g46_00_e08: string
  g46_00_e09: string
  g47_00_e00: string
  g47_00_e01: string
  g47_00_e02: string
  g47_00_e03: string
  g47_00_e04: string
  g47_00_e05: string
  g47_00_e06: string
  g47_00_e07: string
  g47_00_e08: string
  g47_00_e09: string
  g48_00_e00: string
  g48_00_e01: string
  g48_00_e02: string
  g48_00_e03: string
  g48_00_e04: string
  g48_00_e05: string
  g48_00_e06: string
  g48_00_e07: string
  g48_00_e08: string
  g48_00_e09: string
  g49_00_e00: string
  g49_00_e01: string
  g49_00_e02: string
  g49_00_e03: string
  g49_00_e04: string
  g49_00_e05: string
  g49_00_e06: string
  g49_00_e07: string
  g49_00_e08: string
  g49_00_e09: string
}

declare const standardSchema: StandardSchemaV1<Input>

const schema = defineSchema(
  {
    g00: {
      type: 'group',
      schema: {
        g00_00: {
          type: 'group',
          schema: {
            g00_00_e00: { type: 'text' },
            g00_00_e01: { type: 'text' },
            g00_00_e02: { type: 'text' },
            g00_00_e03: { type: 'text' },
            g00_00_e04: { type: 'text' },
            g00_00_e05: { type: 'text' },
            g00_00_e06: { type: 'text' },
            g00_00_e07: { type: 'text' },
            g00_00_e08: { type: 'text' },
            g00_00_e09: { type: 'text' },
          },
        },
      },
    },
    g01: {
      type: 'group',
      schema: {
        g01_00: {
          type: 'group',
          schema: {
            g01_00_e00: { type: 'text' },
            g01_00_e01: { type: 'text' },
            g01_00_e02: { type: 'text' },
            g01_00_e03: { type: 'text' },
            g01_00_e04: { type: 'text' },
            g01_00_e05: { type: 'text' },
            g01_00_e06: { type: 'text' },
            g01_00_e07: { type: 'text' },
            g01_00_e08: { type: 'text' },
            g01_00_e09: { type: 'text' },
          },
        },
      },
    },
    g02: {
      type: 'group',
      schema: {
        g02_00: {
          type: 'group',
          schema: {
            g02_00_e00: { type: 'text' },
            g02_00_e01: { type: 'text' },
            g02_00_e02: { type: 'text' },
            g02_00_e03: { type: 'text' },
            g02_00_e04: { type: 'text' },
            g02_00_e05: { type: 'text' },
            g02_00_e06: { type: 'text' },
            g02_00_e07: { type: 'text' },
            g02_00_e08: { type: 'text' },
            g02_00_e09: { type: 'text' },
          },
        },
      },
    },
    g03: {
      type: 'group',
      schema: {
        g03_00: {
          type: 'group',
          schema: {
            g03_00_e00: { type: 'text' },
            g03_00_e01: { type: 'text' },
            g03_00_e02: { type: 'text' },
            g03_00_e03: { type: 'text' },
            g03_00_e04: { type: 'text' },
            g03_00_e05: { type: 'text' },
            g03_00_e06: { type: 'text' },
            g03_00_e07: { type: 'text' },
            g03_00_e08: { type: 'text' },
            g03_00_e09: { type: 'text' },
          },
        },
      },
    },
    g04: {
      type: 'group',
      schema: {
        g04_00: {
          type: 'group',
          schema: {
            g04_00_e00: { type: 'text' },
            g04_00_e01: { type: 'text' },
            g04_00_e02: { type: 'text' },
            g04_00_e03: { type: 'text' },
            g04_00_e04: { type: 'text' },
            g04_00_e05: { type: 'text' },
            g04_00_e06: { type: 'text' },
            g04_00_e07: { type: 'text' },
            g04_00_e08: { type: 'text' },
            g04_00_e09: { type: 'text' },
          },
        },
      },
    },
    g05: {
      type: 'group',
      schema: {
        g05_00: {
          type: 'group',
          schema: {
            g05_00_e00: { type: 'text' },
            g05_00_e01: { type: 'text' },
            g05_00_e02: { type: 'text' },
            g05_00_e03: { type: 'text' },
            g05_00_e04: { type: 'text' },
            g05_00_e05: { type: 'text' },
            g05_00_e06: { type: 'text' },
            g05_00_e07: { type: 'text' },
            g05_00_e08: { type: 'text' },
            g05_00_e09: { type: 'text' },
          },
        },
      },
    },
    g06: {
      type: 'group',
      schema: {
        g06_00: {
          type: 'group',
          schema: {
            g06_00_e00: { type: 'text' },
            g06_00_e01: { type: 'text' },
            g06_00_e02: { type: 'text' },
            g06_00_e03: { type: 'text' },
            g06_00_e04: { type: 'text' },
            g06_00_e05: { type: 'text' },
            g06_00_e06: { type: 'text' },
            g06_00_e07: { type: 'text' },
            g06_00_e08: { type: 'text' },
            g06_00_e09: { type: 'text' },
          },
        },
      },
    },
    g07: {
      type: 'group',
      schema: {
        g07_00: {
          type: 'group',
          schema: {
            g07_00_e00: { type: 'text' },
            g07_00_e01: { type: 'text' },
            g07_00_e02: { type: 'text' },
            g07_00_e03: { type: 'text' },
            g07_00_e04: { type: 'text' },
            g07_00_e05: { type: 'text' },
            g07_00_e06: { type: 'text' },
            g07_00_e07: { type: 'text' },
            g07_00_e08: { type: 'text' },
            g07_00_e09: { type: 'text' },
          },
        },
      },
    },
    g08: {
      type: 'group',
      schema: {
        g08_00: {
          type: 'group',
          schema: {
            g08_00_e00: { type: 'text' },
            g08_00_e01: { type: 'text' },
            g08_00_e02: { type: 'text' },
            g08_00_e03: { type: 'text' },
            g08_00_e04: { type: 'text' },
            g08_00_e05: { type: 'text' },
            g08_00_e06: { type: 'text' },
            g08_00_e07: { type: 'text' },
            g08_00_e08: { type: 'text' },
            g08_00_e09: { type: 'text' },
          },
        },
      },
    },
    g09: {
      type: 'group',
      schema: {
        g09_00: {
          type: 'group',
          schema: {
            g09_00_e00: { type: 'text' },
            g09_00_e01: { type: 'text' },
            g09_00_e02: { type: 'text' },
            g09_00_e03: { type: 'text' },
            g09_00_e04: { type: 'text' },
            g09_00_e05: { type: 'text' },
            g09_00_e06: { type: 'text' },
            g09_00_e07: { type: 'text' },
            g09_00_e08: { type: 'text' },
            g09_00_e09: { type: 'text' },
          },
        },
      },
    },
    g10: {
      type: 'group',
      schema: {
        g10_00: {
          type: 'group',
          schema: {
            g10_00_e00: { type: 'text' },
            g10_00_e01: { type: 'text' },
            g10_00_e02: { type: 'text' },
            g10_00_e03: { type: 'text' },
            g10_00_e04: { type: 'text' },
            g10_00_e05: { type: 'text' },
            g10_00_e06: { type: 'text' },
            g10_00_e07: { type: 'text' },
            g10_00_e08: { type: 'text' },
            g10_00_e09: { type: 'text' },
          },
        },
      },
    },
    g11: {
      type: 'group',
      schema: {
        g11_00: {
          type: 'group',
          schema: {
            g11_00_e00: { type: 'text' },
            g11_00_e01: { type: 'text' },
            g11_00_e02: { type: 'text' },
            g11_00_e03: { type: 'text' },
            g11_00_e04: { type: 'text' },
            g11_00_e05: { type: 'text' },
            g11_00_e06: { type: 'text' },
            g11_00_e07: { type: 'text' },
            g11_00_e08: { type: 'text' },
            g11_00_e09: { type: 'text' },
          },
        },
      },
    },
    g12: {
      type: 'group',
      schema: {
        g12_00: {
          type: 'group',
          schema: {
            g12_00_e00: { type: 'text' },
            g12_00_e01: { type: 'text' },
            g12_00_e02: { type: 'text' },
            g12_00_e03: { type: 'text' },
            g12_00_e04: { type: 'text' },
            g12_00_e05: { type: 'text' },
            g12_00_e06: { type: 'text' },
            g12_00_e07: { type: 'text' },
            g12_00_e08: { type: 'text' },
            g12_00_e09: { type: 'text' },
          },
        },
      },
    },
    g13: {
      type: 'group',
      schema: {
        g13_00: {
          type: 'group',
          schema: {
            g13_00_e00: { type: 'text' },
            g13_00_e01: { type: 'text' },
            g13_00_e02: { type: 'text' },
            g13_00_e03: { type: 'text' },
            g13_00_e04: { type: 'text' },
            g13_00_e05: { type: 'text' },
            g13_00_e06: { type: 'text' },
            g13_00_e07: { type: 'text' },
            g13_00_e08: { type: 'text' },
            g13_00_e09: { type: 'text' },
          },
        },
      },
    },
    g14: {
      type: 'group',
      schema: {
        g14_00: {
          type: 'group',
          schema: {
            g14_00_e00: { type: 'text' },
            g14_00_e01: { type: 'text' },
            g14_00_e02: { type: 'text' },
            g14_00_e03: { type: 'text' },
            g14_00_e04: { type: 'text' },
            g14_00_e05: { type: 'text' },
            g14_00_e06: { type: 'text' },
            g14_00_e07: { type: 'text' },
            g14_00_e08: { type: 'text' },
            g14_00_e09: { type: 'text' },
          },
        },
      },
    },
    g15: {
      type: 'group',
      schema: {
        g15_00: {
          type: 'group',
          schema: {
            g15_00_e00: { type: 'text' },
            g15_00_e01: { type: 'text' },
            g15_00_e02: { type: 'text' },
            g15_00_e03: { type: 'text' },
            g15_00_e04: { type: 'text' },
            g15_00_e05: { type: 'text' },
            g15_00_e06: { type: 'text' },
            g15_00_e07: { type: 'text' },
            g15_00_e08: { type: 'text' },
            g15_00_e09: { type: 'text' },
          },
        },
      },
    },
    g16: {
      type: 'group',
      schema: {
        g16_00: {
          type: 'group',
          schema: {
            g16_00_e00: { type: 'text' },
            g16_00_e01: { type: 'text' },
            g16_00_e02: { type: 'text' },
            g16_00_e03: { type: 'text' },
            g16_00_e04: { type: 'text' },
            g16_00_e05: { type: 'text' },
            g16_00_e06: { type: 'text' },
            g16_00_e07: { type: 'text' },
            g16_00_e08: { type: 'text' },
            g16_00_e09: { type: 'text' },
          },
        },
      },
    },
    g17: {
      type: 'group',
      schema: {
        g17_00: {
          type: 'group',
          schema: {
            g17_00_e00: { type: 'text' },
            g17_00_e01: { type: 'text' },
            g17_00_e02: { type: 'text' },
            g17_00_e03: { type: 'text' },
            g17_00_e04: { type: 'text' },
            g17_00_e05: { type: 'text' },
            g17_00_e06: { type: 'text' },
            g17_00_e07: { type: 'text' },
            g17_00_e08: { type: 'text' },
            g17_00_e09: { type: 'text' },
          },
        },
      },
    },
    g18: {
      type: 'group',
      schema: {
        g18_00: {
          type: 'group',
          schema: {
            g18_00_e00: { type: 'text' },
            g18_00_e01: { type: 'text' },
            g18_00_e02: { type: 'text' },
            g18_00_e03: { type: 'text' },
            g18_00_e04: { type: 'text' },
            g18_00_e05: { type: 'text' },
            g18_00_e06: { type: 'text' },
            g18_00_e07: { type: 'text' },
            g18_00_e08: { type: 'text' },
            g18_00_e09: { type: 'text' },
          },
        },
      },
    },
    g19: {
      type: 'group',
      schema: {
        g19_00: {
          type: 'group',
          schema: {
            g19_00_e00: { type: 'text' },
            g19_00_e01: { type: 'text' },
            g19_00_e02: { type: 'text' },
            g19_00_e03: { type: 'text' },
            g19_00_e04: { type: 'text' },
            g19_00_e05: { type: 'text' },
            g19_00_e06: { type: 'text' },
            g19_00_e07: { type: 'text' },
            g19_00_e08: { type: 'text' },
            g19_00_e09: { type: 'text' },
          },
        },
      },
    },
    g20: {
      type: 'group',
      schema: {
        g20_00: {
          type: 'group',
          schema: {
            g20_00_e00: { type: 'text' },
            g20_00_e01: { type: 'text' },
            g20_00_e02: { type: 'text' },
            g20_00_e03: { type: 'text' },
            g20_00_e04: { type: 'text' },
            g20_00_e05: { type: 'text' },
            g20_00_e06: { type: 'text' },
            g20_00_e07: { type: 'text' },
            g20_00_e08: { type: 'text' },
            g20_00_e09: { type: 'text' },
          },
        },
      },
    },
    g21: {
      type: 'group',
      schema: {
        g21_00: {
          type: 'group',
          schema: {
            g21_00_e00: { type: 'text' },
            g21_00_e01: { type: 'text' },
            g21_00_e02: { type: 'text' },
            g21_00_e03: { type: 'text' },
            g21_00_e04: { type: 'text' },
            g21_00_e05: { type: 'text' },
            g21_00_e06: { type: 'text' },
            g21_00_e07: { type: 'text' },
            g21_00_e08: { type: 'text' },
            g21_00_e09: { type: 'text' },
          },
        },
      },
    },
    g22: {
      type: 'group',
      schema: {
        g22_00: {
          type: 'group',
          schema: {
            g22_00_e00: { type: 'text' },
            g22_00_e01: { type: 'text' },
            g22_00_e02: { type: 'text' },
            g22_00_e03: { type: 'text' },
            g22_00_e04: { type: 'text' },
            g22_00_e05: { type: 'text' },
            g22_00_e06: { type: 'text' },
            g22_00_e07: { type: 'text' },
            g22_00_e08: { type: 'text' },
            g22_00_e09: { type: 'text' },
          },
        },
      },
    },
    g23: {
      type: 'group',
      schema: {
        g23_00: {
          type: 'group',
          schema: {
            g23_00_e00: { type: 'text' },
            g23_00_e01: { type: 'text' },
            g23_00_e02: { type: 'text' },
            g23_00_e03: { type: 'text' },
            g23_00_e04: { type: 'text' },
            g23_00_e05: { type: 'text' },
            g23_00_e06: { type: 'text' },
            g23_00_e07: { type: 'text' },
            g23_00_e08: { type: 'text' },
            g23_00_e09: { type: 'text' },
          },
        },
      },
    },
    g24: {
      type: 'group',
      schema: {
        g24_00: {
          type: 'group',
          schema: {
            g24_00_e00: { type: 'text' },
            g24_00_e01: { type: 'text' },
            g24_00_e02: { type: 'text' },
            g24_00_e03: { type: 'text' },
            g24_00_e04: { type: 'text' },
            g24_00_e05: { type: 'text' },
            g24_00_e06: { type: 'text' },
            g24_00_e07: { type: 'text' },
            g24_00_e08: { type: 'text' },
            g24_00_e09: { type: 'text' },
          },
        },
      },
    },
    g25: {
      type: 'group',
      schema: {
        g25_00: {
          type: 'group',
          schema: {
            g25_00_e00: { type: 'text' },
            g25_00_e01: { type: 'text' },
            g25_00_e02: { type: 'text' },
            g25_00_e03: { type: 'text' },
            g25_00_e04: { type: 'text' },
            g25_00_e05: { type: 'text' },
            g25_00_e06: { type: 'text' },
            g25_00_e07: { type: 'text' },
            g25_00_e08: { type: 'text' },
            g25_00_e09: { type: 'text' },
          },
        },
      },
    },
    g26: {
      type: 'group',
      schema: {
        g26_00: {
          type: 'group',
          schema: {
            g26_00_e00: { type: 'text' },
            g26_00_e01: { type: 'text' },
            g26_00_e02: { type: 'text' },
            g26_00_e03: { type: 'text' },
            g26_00_e04: { type: 'text' },
            g26_00_e05: { type: 'text' },
            g26_00_e06: { type: 'text' },
            g26_00_e07: { type: 'text' },
            g26_00_e08: { type: 'text' },
            g26_00_e09: { type: 'text' },
          },
        },
      },
    },
    g27: {
      type: 'group',
      schema: {
        g27_00: {
          type: 'group',
          schema: {
            g27_00_e00: { type: 'text' },
            g27_00_e01: { type: 'text' },
            g27_00_e02: { type: 'text' },
            g27_00_e03: { type: 'text' },
            g27_00_e04: { type: 'text' },
            g27_00_e05: { type: 'text' },
            g27_00_e06: { type: 'text' },
            g27_00_e07: { type: 'text' },
            g27_00_e08: { type: 'text' },
            g27_00_e09: { type: 'text' },
          },
        },
      },
    },
    g28: {
      type: 'group',
      schema: {
        g28_00: {
          type: 'group',
          schema: {
            g28_00_e00: { type: 'text' },
            g28_00_e01: { type: 'text' },
            g28_00_e02: { type: 'text' },
            g28_00_e03: { type: 'text' },
            g28_00_e04: { type: 'text' },
            g28_00_e05: { type: 'text' },
            g28_00_e06: { type: 'text' },
            g28_00_e07: { type: 'text' },
            g28_00_e08: { type: 'text' },
            g28_00_e09: { type: 'text' },
          },
        },
      },
    },
    g29: {
      type: 'group',
      schema: {
        g29_00: {
          type: 'group',
          schema: {
            g29_00_e00: { type: 'text' },
            g29_00_e01: { type: 'text' },
            g29_00_e02: { type: 'text' },
            g29_00_e03: { type: 'text' },
            g29_00_e04: { type: 'text' },
            g29_00_e05: { type: 'text' },
            g29_00_e06: { type: 'text' },
            g29_00_e07: { type: 'text' },
            g29_00_e08: { type: 'text' },
            g29_00_e09: { type: 'text' },
          },
        },
      },
    },
    g30: {
      type: 'group',
      schema: {
        g30_00: {
          type: 'group',
          schema: {
            g30_00_e00: { type: 'text' },
            g30_00_e01: { type: 'text' },
            g30_00_e02: { type: 'text' },
            g30_00_e03: { type: 'text' },
            g30_00_e04: { type: 'text' },
            g30_00_e05: { type: 'text' },
            g30_00_e06: { type: 'text' },
            g30_00_e07: { type: 'text' },
            g30_00_e08: { type: 'text' },
            g30_00_e09: { type: 'text' },
          },
        },
      },
    },
    g31: {
      type: 'group',
      schema: {
        g31_00: {
          type: 'group',
          schema: {
            g31_00_e00: { type: 'text' },
            g31_00_e01: { type: 'text' },
            g31_00_e02: { type: 'text' },
            g31_00_e03: { type: 'text' },
            g31_00_e04: { type: 'text' },
            g31_00_e05: { type: 'text' },
            g31_00_e06: { type: 'text' },
            g31_00_e07: { type: 'text' },
            g31_00_e08: { type: 'text' },
            g31_00_e09: { type: 'text' },
          },
        },
      },
    },
    g32: {
      type: 'group',
      schema: {
        g32_00: {
          type: 'group',
          schema: {
            g32_00_e00: { type: 'text' },
            g32_00_e01: { type: 'text' },
            g32_00_e02: { type: 'text' },
            g32_00_e03: { type: 'text' },
            g32_00_e04: { type: 'text' },
            g32_00_e05: { type: 'text' },
            g32_00_e06: { type: 'text' },
            g32_00_e07: { type: 'text' },
            g32_00_e08: { type: 'text' },
            g32_00_e09: { type: 'text' },
          },
        },
      },
    },
    g33: {
      type: 'group',
      schema: {
        g33_00: {
          type: 'group',
          schema: {
            g33_00_e00: { type: 'text' },
            g33_00_e01: { type: 'text' },
            g33_00_e02: { type: 'text' },
            g33_00_e03: { type: 'text' },
            g33_00_e04: { type: 'text' },
            g33_00_e05: { type: 'text' },
            g33_00_e06: { type: 'text' },
            g33_00_e07: { type: 'text' },
            g33_00_e08: { type: 'text' },
            g33_00_e09: { type: 'text' },
          },
        },
      },
    },
    g34: {
      type: 'group',
      schema: {
        g34_00: {
          type: 'group',
          schema: {
            g34_00_e00: { type: 'text' },
            g34_00_e01: { type: 'text' },
            g34_00_e02: { type: 'text' },
            g34_00_e03: { type: 'text' },
            g34_00_e04: { type: 'text' },
            g34_00_e05: { type: 'text' },
            g34_00_e06: { type: 'text' },
            g34_00_e07: { type: 'text' },
            g34_00_e08: { type: 'text' },
            g34_00_e09: { type: 'text' },
          },
        },
      },
    },
    g35: {
      type: 'group',
      schema: {
        g35_00: {
          type: 'group',
          schema: {
            g35_00_e00: { type: 'text' },
            g35_00_e01: { type: 'text' },
            g35_00_e02: { type: 'text' },
            g35_00_e03: { type: 'text' },
            g35_00_e04: { type: 'text' },
            g35_00_e05: { type: 'text' },
            g35_00_e06: { type: 'text' },
            g35_00_e07: { type: 'text' },
            g35_00_e08: { type: 'text' },
            g35_00_e09: { type: 'text' },
          },
        },
      },
    },
    g36: {
      type: 'group',
      schema: {
        g36_00: {
          type: 'group',
          schema: {
            g36_00_e00: { type: 'text' },
            g36_00_e01: { type: 'text' },
            g36_00_e02: { type: 'text' },
            g36_00_e03: { type: 'text' },
            g36_00_e04: { type: 'text' },
            g36_00_e05: { type: 'text' },
            g36_00_e06: { type: 'text' },
            g36_00_e07: { type: 'text' },
            g36_00_e08: { type: 'text' },
            g36_00_e09: { type: 'text' },
          },
        },
      },
    },
    g37: {
      type: 'group',
      schema: {
        g37_00: {
          type: 'group',
          schema: {
            g37_00_e00: { type: 'text' },
            g37_00_e01: { type: 'text' },
            g37_00_e02: { type: 'text' },
            g37_00_e03: { type: 'text' },
            g37_00_e04: { type: 'text' },
            g37_00_e05: { type: 'text' },
            g37_00_e06: { type: 'text' },
            g37_00_e07: { type: 'text' },
            g37_00_e08: { type: 'text' },
            g37_00_e09: { type: 'text' },
          },
        },
      },
    },
    g38: {
      type: 'group',
      schema: {
        g38_00: {
          type: 'group',
          schema: {
            g38_00_e00: { type: 'text' },
            g38_00_e01: { type: 'text' },
            g38_00_e02: { type: 'text' },
            g38_00_e03: { type: 'text' },
            g38_00_e04: { type: 'text' },
            g38_00_e05: { type: 'text' },
            g38_00_e06: { type: 'text' },
            g38_00_e07: { type: 'text' },
            g38_00_e08: { type: 'text' },
            g38_00_e09: { type: 'text' },
          },
        },
      },
    },
    g39: {
      type: 'group',
      schema: {
        g39_00: {
          type: 'group',
          schema: {
            g39_00_e00: { type: 'text' },
            g39_00_e01: { type: 'text' },
            g39_00_e02: { type: 'text' },
            g39_00_e03: { type: 'text' },
            g39_00_e04: { type: 'text' },
            g39_00_e05: { type: 'text' },
            g39_00_e06: { type: 'text' },
            g39_00_e07: { type: 'text' },
            g39_00_e08: { type: 'text' },
            g39_00_e09: { type: 'text' },
          },
        },
      },
    },
    g40: {
      type: 'group',
      schema: {
        g40_00: {
          type: 'group',
          schema: {
            g40_00_e00: { type: 'text' },
            g40_00_e01: { type: 'text' },
            g40_00_e02: { type: 'text' },
            g40_00_e03: { type: 'text' },
            g40_00_e04: { type: 'text' },
            g40_00_e05: { type: 'text' },
            g40_00_e06: { type: 'text' },
            g40_00_e07: { type: 'text' },
            g40_00_e08: { type: 'text' },
            g40_00_e09: { type: 'text' },
          },
        },
      },
    },
    g41: {
      type: 'group',
      schema: {
        g41_00: {
          type: 'group',
          schema: {
            g41_00_e00: { type: 'text' },
            g41_00_e01: { type: 'text' },
            g41_00_e02: { type: 'text' },
            g41_00_e03: { type: 'text' },
            g41_00_e04: { type: 'text' },
            g41_00_e05: { type: 'text' },
            g41_00_e06: { type: 'text' },
            g41_00_e07: { type: 'text' },
            g41_00_e08: { type: 'text' },
            g41_00_e09: { type: 'text' },
          },
        },
      },
    },
    g42: {
      type: 'group',
      schema: {
        g42_00: {
          type: 'group',
          schema: {
            g42_00_e00: { type: 'text' },
            g42_00_e01: { type: 'text' },
            g42_00_e02: { type: 'text' },
            g42_00_e03: { type: 'text' },
            g42_00_e04: { type: 'text' },
            g42_00_e05: { type: 'text' },
            g42_00_e06: { type: 'text' },
            g42_00_e07: { type: 'text' },
            g42_00_e08: { type: 'text' },
            g42_00_e09: { type: 'text' },
          },
        },
      },
    },
    g43: {
      type: 'group',
      schema: {
        g43_00: {
          type: 'group',
          schema: {
            g43_00_e00: { type: 'text' },
            g43_00_e01: { type: 'text' },
            g43_00_e02: { type: 'text' },
            g43_00_e03: { type: 'text' },
            g43_00_e04: { type: 'text' },
            g43_00_e05: { type: 'text' },
            g43_00_e06: { type: 'text' },
            g43_00_e07: { type: 'text' },
            g43_00_e08: { type: 'text' },
            g43_00_e09: { type: 'text' },
          },
        },
      },
    },
    g44: {
      type: 'group',
      schema: {
        g44_00: {
          type: 'group',
          schema: {
            g44_00_e00: { type: 'text' },
            g44_00_e01: { type: 'text' },
            g44_00_e02: { type: 'text' },
            g44_00_e03: { type: 'text' },
            g44_00_e04: { type: 'text' },
            g44_00_e05: { type: 'text' },
            g44_00_e06: { type: 'text' },
            g44_00_e07: { type: 'text' },
            g44_00_e08: { type: 'text' },
            g44_00_e09: { type: 'text' },
          },
        },
      },
    },
    g45: {
      type: 'group',
      schema: {
        g45_00: {
          type: 'group',
          schema: {
            g45_00_e00: { type: 'text' },
            g45_00_e01: { type: 'text' },
            g45_00_e02: { type: 'text' },
            g45_00_e03: { type: 'text' },
            g45_00_e04: { type: 'text' },
            g45_00_e05: { type: 'text' },
            g45_00_e06: { type: 'text' },
            g45_00_e07: { type: 'text' },
            g45_00_e08: { type: 'text' },
            g45_00_e09: { type: 'text' },
          },
        },
      },
    },
    g46: {
      type: 'group',
      schema: {
        g46_00: {
          type: 'group',
          schema: {
            g46_00_e00: { type: 'text' },
            g46_00_e01: { type: 'text' },
            g46_00_e02: { type: 'text' },
            g46_00_e03: { type: 'text' },
            g46_00_e04: { type: 'text' },
            g46_00_e05: { type: 'text' },
            g46_00_e06: { type: 'text' },
            g46_00_e07: { type: 'text' },
            g46_00_e08: { type: 'text' },
            g46_00_e09: { type: 'text' },
          },
        },
      },
    },
    g47: {
      type: 'group',
      schema: {
        g47_00: {
          type: 'group',
          schema: {
            g47_00_e00: { type: 'text' },
            g47_00_e01: { type: 'text' },
            g47_00_e02: { type: 'text' },
            g47_00_e03: { type: 'text' },
            g47_00_e04: { type: 'text' },
            g47_00_e05: { type: 'text' },
            g47_00_e06: { type: 'text' },
            g47_00_e07: { type: 'text' },
            g47_00_e08: { type: 'text' },
            g47_00_e09: { type: 'text' },
          },
        },
      },
    },
    g48: {
      type: 'group',
      schema: {
        g48_00: {
          type: 'group',
          schema: {
            g48_00_e00: { type: 'text' },
            g48_00_e01: { type: 'text' },
            g48_00_e02: { type: 'text' },
            g48_00_e03: { type: 'text' },
            g48_00_e04: { type: 'text' },
            g48_00_e05: { type: 'text' },
            g48_00_e06: { type: 'text' },
            g48_00_e07: { type: 'text' },
            g48_00_e08: { type: 'text' },
            g48_00_e09: { type: 'text' },
          },
        },
      },
    },
    g49: {
      type: 'group',
      schema: {
        g49_00: {
          type: 'group',
          schema: {
            g49_00_e00: { type: 'text' },
            g49_00_e01: { type: 'text' },
            g49_00_e02: { type: 'text' },
            g49_00_e03: { type: 'text' },
            g49_00_e04: { type: 'text' },
            g49_00_e05: { type: 'text' },
            g49_00_e06: { type: 'text' },
            g49_00_e07: { type: 'text' },
            g49_00_e08: { type: 'text' },
            g49_00_e09: { type: 'text' },
          },
        },
      },
    },
  },
  standardSchema
)

void schema

export {}
