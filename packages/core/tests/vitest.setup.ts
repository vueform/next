if (typeof window !== 'undefined') {
  // eslint-disable-next-line
  ;(window as any).c = (...args: any[]) => console.log(...args)
}

declare global {
  interface Window {
    c: (...args: any[]) => void
  }
}

expect.extend({
  toMatchAll: (received, expected) => ({
    pass:
      expected.every((e: string) => received.includes(e)) &&
      received.split(' ').every((e: string) => expected.includes(e)) &&
      expected.length === received.split(' ').length,
    message: () =>
      `${JSON.stringify(
        typeof received === 'string'
          ? received.split(' ').sort()
          : received.sort(),
        null,
        2
      )} does not match all of ${JSON.stringify(expected.sort(), null, 2)}`,
  }),
  toNotMatch: (received, expected) => {
    if (typeof received === 'string') {
      received = received.split(' ')
    }

    const pass = expected.every((e: string) =>
      received.every((r: string | string[] | Record<string, boolean>) =>
        typeof r === 'string' || Array.isArray(r)
          ? !r.includes(e)
          : !r
            ? true
            : !Object.keys(r).includes(e)
      )
    )
    return {
      pass,
      message: () =>
        `${JSON.stringify(
          typeof received === 'string' ? received.split(' ') : received
        )} contains some of ${JSON.stringify(expected)}`,
    }
  },
})

interface CustomMatchers<R = unknown> {
  toMatchAll: (expected: string[]) => R
  toNotMatch: (expected: string[]) => R
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}

export {}
