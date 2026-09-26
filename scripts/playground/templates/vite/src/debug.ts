// Debugging `c` method as an alias for `console.log`

;(window as any).c = (...args: any[]) => console.log(...args)
declare global {
  interface Window {
    c: (...args: any[]) => void
  }
}
