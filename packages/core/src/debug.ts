// Debugging `c` method as an alias for `console.log`

if (typeof window !== 'undefined') {
  ;(window as any).c = function (...args: any[]) {
    // eslint-disable-next-line
    console.log(...args)
  }
}
declare global {
  interface Window {
    c: (...args: any[]) => void
  }
}
