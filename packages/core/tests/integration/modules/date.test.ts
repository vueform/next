import { ref } from 'vue'

import { createForm } from '../../helpers'

const defineSchema = <T extends Record<string, any>>(schema: T) => ref(schema)

describe('Date Provider', () => {
  describe('Validation: date rule', () => {
    it('should pass for a valid ISO date', async () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'date', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should pass for a full ISO datetime string', async () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            rules: 'date',
            default: '2026-03-21T14:30:00.000Z',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should fail for an invalid date string', async () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'date', default: 'not-a-date' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })

    it('should fail for an empty string', async () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'date', default: '' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })

    it('should fail for random text', async () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'date', default: 'hello world' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })
  })

  describe('Validation: after rule', () => {
    it('should pass when date is after the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-20' },
          el: { type: 'text', rules: 'after:ref', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should fail when date is before the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-22' },
          el: { type: 'text', rules: 'after:ref', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })

    it('should fail when date equals the reference (strictly after)', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-21' },
          el: { type: 'text', rules: 'after:ref', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })

    it('should pass when date is after today', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'after:today', default: '2026-03-22' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)

      vi.useRealTimers()
    })

    it('should fail when date is today with after:today', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'after:today', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)

      vi.useRealTimers()
    })

    it('should pass when date is after yesterday', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'after:yesterday', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('Validation: before rule', () => {
    it('should pass when date is before the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-22' },
          el: { type: 'text', rules: 'before:ref', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should fail when date is after the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-20' },
          el: { type: 'text', rules: 'before:ref', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })

    it('should fail when date equals the reference (strictly before)', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-21' },
          el: { type: 'text', rules: 'before:ref', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })

    it('should pass when date is before tomorrow', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'before:tomorrow', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)

      vi.useRealTimers()
    })

    it('should fail when date is tomorrow with before:tomorrow', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', rules: 'before:tomorrow', default: '2026-03-22' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)

      vi.useRealTimers()
    })
  })

  describe('Validation: after_or_equal rule', () => {
    it('should pass when date equals the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-21' },
          el: {
            type: 'text',
            rules: 'after_or_equal:ref',
            default: '2026-03-21',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should pass when date is after the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-20' },
          el: {
            type: 'text',
            rules: 'after_or_equal:ref',
            default: '2026-03-21',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should fail when date is before the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-22' },
          el: {
            type: 'text',
            rules: 'after_or_equal:ref',
            default: '2026-03-21',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })
  })

  describe('Validation: before_or_equal rule', () => {
    it('should pass when date equals the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-21' },
          el: {
            type: 'text',
            rules: 'before_or_equal:ref',
            default: '2026-03-21',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should pass when date is before the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-22' },
          el: {
            type: 'text',
            rules: 'before_or_equal:ref',
            default: '2026-03-21',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should fail when date is after the reference', async () => {
      const { el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-20' },
          el: {
            type: 'text',
            rules: 'before_or_equal:ref',
            default: '2026-03-21',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })
  })

  describe('Validation: date range (combining after and before)', () => {
    it('should pass when date is within range', async () => {
      const { el } = createForm({
        schema: defineSchema({
          start: { type: 'text', default: '2026-03-01' },
          end: { type: 'text', default: '2026-03-31' },
          el: {
            type: 'text',
            rules: 'after:start|before:end',
            default: '2026-03-15',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)
    })

    it('should fail when date is outside range', async () => {
      const { el } = createForm({
        schema: defineSchema({
          start: { type: 'text', default: '2026-03-01' },
          end: { type: 'text', default: '2026-03-31' },
          el: {
            type: 'text',
            rules: 'after:start|before:end',
            default: '2026-04-15',
          },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(true)
    })
  })

  describe('Validation: revalidation on reference change', () => {
    it('should reflect updated reference date on revalidation', async () => {
      const { ref: refEl, el } = createForm({
        schema: defineSchema({
          ref: { type: 'text', default: '2026-03-20' },
          el: { type: 'text', rules: 'after:ref', default: '2026-03-21' },
        }),
      })

      await el.validate()
      expect(el.invalid).toBe(false)

      refEl.update('2026-03-25')
      await el.validate()
      expect(el.invalid).toBe(true)
    })
  })

  describe('Conditions: date operators', () => {
    it('should show element when date is today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { date, target } = createForm({
        schema: defineSchema({
          date: { type: 'text', default: '2026-03-21' },
          target: { type: 'text', conditions: [['date', 'today']] },
        }),
      })

      expect(target.available).toBe(true)

      date.update('2026-03-20')
      expect(target.available).toBe(false)

      vi.useRealTimers()
    })

    it('should show element when date is after reference', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { date, target } = createForm({
        schema: defineSchema({
          date: { type: 'text', default: '2026-03-25' },
          target: { type: 'text', conditions: [['date', 'after', 'today']] },
        }),
      })

      expect(target.available).toBe(true)

      date.update('2026-03-20')
      expect(target.available).toBe(false)

      vi.useRealTimers()
    })

    it('should show element when date is before reference', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { date, target } = createForm({
        schema: defineSchema({
          date: { type: 'text', default: '2026-03-15' },
          target: { type: 'text', conditions: [['date', 'before', 'today']] },
        }),
      })

      expect(target.available).toBe(true)

      date.update('2026-03-25')
      expect(target.available).toBe(false)

      vi.useRealTimers()
    })

    it('should hide element when date is not today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 21))

      const { target } = createForm({
        schema: defineSchema({
          date: { type: 'text', default: '2026-03-22' },
          target: { type: 'text', conditions: [['date', 'today']] },
        }),
      })

      expect(target.available).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('Expression Functions', () => {
    describe('TODAY()', () => {
      it('should return today in YYYY-MM-DD format', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 2, 21))

        const { result } = createForm({
          schema: defineSchema({
            result: { type: 'text', default: '{TODAY()}' },
          }),
        })

        expect(result.model).toBe('2026-03-21')

        vi.useRealTimers()
      })

      it('should update label with today', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 2, 21))

        const { el } = createForm({
          schema: defineSchema({
            el: { type: 'text', label: 'Date: {TODAY()}' },
          }),
        })

        expect(el.label).toBe('Date: 2026-03-21')

        vi.useRealTimers()
      })
    })

    describe('NOW()', () => {
      it('should return current datetime as ISO string', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 2, 21, 14, 30, 0))

        const { result } = createForm({
          schema: defineSchema({
            result: { type: 'text', default: '{NOW()}' },
          }),
        })

        expect(result.model).toContain('2026-03-21')
        expect(result.model).toContain('T')

        vi.useRealTimers()
      })
    })

    // AGE, DATE_ADD, FORMAT_DATE rely on the date module but the expression
    // plugin's probe calls the factory with no args, causing module-dependent
    // functions to fail silently (same known limitation as AVAILABLE — see
    // expressions.test.ts). These tests are skipped until the probe is fixed.
    describe('AGE()', () => {
      it('should compute age in years from a birthdate', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 2, 21))

        const { result } = createForm({
          schema: defineSchema({
            dob: { type: 'text', default: '2000-03-15' },
            result: { type: 'text', default: '{AGE(dob)}' },
          }),
        })

        expect(result.model).toBe(26)

        vi.useRealTimers()
      })

      it('should return lower age when birthday has not occurred yet this year', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 2, 21))

        const { result } = createForm({
          schema: defineSchema({
            dob: { type: 'text', default: '2000-03-25' },
            result: { type: 'text', default: '{AGE(dob)}' },
          }),
        })

        expect(result.model).toBe(25)

        vi.useRealTimers()
      })

      it('should return empty string for invalid date', () => {
        const { result } = createForm({
          schema: defineSchema({
            dob: { type: 'text', default: 'invalid' },
            result: { type: 'text', default: '{AGE(dob)}' },
          }),
        })

        expect(result.model).toBe('')
      })
    })

    describe('DATE_ADD()', () => {
      it('should add days and return date string', () => {
        const { result } = createForm({
          schema: defineSchema({
            date: { type: 'text', default: '2026-03-21' },
            result: { type: 'text', default: '{DATE_ADD(date, 5, "days")}' },
          }),
        })

        expect(result.model).toBe('2026-03-26')
      })

      it('should add months', () => {
        const { result } = createForm({
          schema: defineSchema({
            date: { type: 'text', default: '2026-03-21' },
            result: {
              type: 'text',
              default: '{DATE_ADD(date, 2, "months")}',
            },
          }),
        })

        expect(result.model).toBe('2026-05-21')
      })
    })
  })
})
