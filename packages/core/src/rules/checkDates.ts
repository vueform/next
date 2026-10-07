import { useDate } from '#src/composables'
import type { VueformInstance } from '#src/helpers'
import type { DateInstance } from '#src/modules/date'
import type { StatefulElement } from '#src/types'

export function checkDates(
  value: any,
  {
    params,
    el$,
    vueform,
  }: {
    params: {
      date$: StatefulElement | undefined
      date: string
    }
    el$: StatefulElement
    vueform: VueformInstance
  },
  callback: (date: DateInstance, otherDate: DateInstance) => boolean
) {
  if (!Array.isArray(value)) value = [value]

  let otherDates: DateInstance[]

  if (params.date$) {
    otherDates = Array.isArray(params.date$.value)
      ? params.date$.value.map((value: any) =>
          useDate(value, params.date$?.valueFormat, vueform)
        )
      : [useDate(params.date$.value, params.date$.valueFormat, vueform)]
  } else {
    switch (params.date) {
      case 'today':
        otherDates = [useDate(undefined, undefined, vueform).startOf('day')]
        break
      case 'tomorrow':
        otherDates = [
          useDate(undefined, undefined, vueform).startOf('day').add(1, 'days'),
        ]
        break
      case 'yesterday':
        otherDates = [
          useDate(undefined, undefined, vueform)
            .startOf('day')
            .subtract(1, 'days'),
        ]
        break
      default:
        otherDates = [useDate(params.date, el$.props?.valueFormat, vueform)]
    }
  }

  return value.every((date: any) =>
    otherDates.every((otherDate) =>
      callback(useDate(date, el$.props?.valueFormat, vueform), otherDate)
    )
  )
}
