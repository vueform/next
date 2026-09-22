export function exprFlatten(args: any[], defaultValue: string | number = 0) {
  const result: (string | number)[] = []
  const toNum = (c: any) =>
    isNaN(Number(c)) || c === null || c === undefined || c === ''
      ? defaultValue
      : Number(c)

  for (const curr of args) {
    if (Array.isArray(curr)) {
      for (const c of curr) {
        result.push(toNum(c))
      }
    } else {
      result.push(toNum(curr))
    }
  }

  return result
}

export function exprSum(args: any[]) {
  return exprFlatten(args).reduce(
    (p: number, c: any) => p + (isNaN(parseInt(c)) ? 0 : parseInt(c)),
    0
  )
}
