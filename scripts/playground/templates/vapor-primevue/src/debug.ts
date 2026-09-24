// Debugging `c` method as an alias for `console.log`
// eslint-disable-next-line
;(window as any).c = (...args: any[]) => console.log(...args)
declare global {
  interface Window {
    c: (...args: any[]) => void
  }
}
