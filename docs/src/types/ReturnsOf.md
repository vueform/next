```ts
/**
 * Picks and merges selected return-type keys from an array of `[function,
 * keys[]]` pairs into a single flat object. Keys selected via the second
 * argument `O` are merged as partial (optional) properties.
 */
type ReturnsOf<
  P extends Pair<any, PropertyKey[]>[],
  O extends Pair<any, PropertyKey[]>[] = [],
> = Prettify<
  UnionToIntersection<
    | {
        [I in keyof P]: P[I] extends Pair<infer F, infer K>
          ? PropertyKey extends keyof FeatureReturn<F>
            ? never
            : Pick<FeatureReturn<F>, Extract<K[number], keyof FeatureReturn<F>>>
          : never
      }[number]
    | {
        [I in keyof O]: O[I] extends Pair<infer F, infer K>
          ? PropertyKey extends keyof FeatureReturn<F>
            ? never
            : Partial<
                Pick<
                  FeatureReturn<F>,
                  Extract<K[number], keyof FeatureReturn<F>>
                >
              >
          : never
      }[number]
  >
>
```
