/*
 * TS performance fixture: defineSchema with 500 leaf elements across
 * 2 nesting levels of `group` containers (50 root groups ×
 * 1 nested group × 10 leaves).
 *
 * Leaves only carry `type`; groups only carry `type` + `schema`.
 * Forces Paths / SchemaToModel / ElementByPath so the measurement covers
 * the full registry-driven schema stack.
 *
 * Measure:
 *   pnpm test:bench-dts define-schema-500
 */
import {
  defineSchema,
  type ElementByPath,
  type Paths,
  type SchemaToModel,
} from '@vueform/core'
import '@vueform/core/components'

const schema = defineSchema({
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
})

type S = typeof schema
type P = Paths<S>
type M = SchemaToModel<S>

type Found = ElementByPath<S, 'g00.g00_00.g00_00_e00'>
type FoundModel = Found['model']
type PathExists = 'g00.g00_00.g00_00_e00' extends P ? true : false
type LeafModel = M['g00_00_e00']

declare const _paths: P
declare const _model: M
declare const _found: Found
declare const _foundModel: FoundModel
declare const _pathExists: PathExists
declare const _leafModel: LeafModel

void schema
void _paths
void _model
void _found
void _foundModel
void _pathExists
void _leafModel

export {}
