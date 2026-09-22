// type MappedOmit<T, K extends keyof any> = {
//   [P in keyof T as P extends K ? never : P]: T[P]
// }

// type WithDefaults<T, D extends Partial<T>> =
//   MappedOmit<T, keyof D> & {
//     [K in keyof D & keyof T]-?: Exclude<T[K], undefined>
//   }

// function useProps<T extends Record<string, any>, const D extends Partial<T>>(
//   defaults: D
// ): WithDefaults<T, D> {
//   return {} as any
// }

// type Props = {
//   foo?: string
//   bar?: string
// }

// const defaults = {
//   foo: 'foo',
// } as const

// const props = useProps<Props>(defaults)
