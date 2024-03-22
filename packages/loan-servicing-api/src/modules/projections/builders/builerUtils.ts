const to = (_: string, v: any): string => {
  if (v && v instanceof Date) {
    return v.toUTCString()
  }

  return v
}

const from = (_: string, v: any): any => {
  if (
    v &&
    typeof v === 'string' &&
    v.indexOf('Z') > -1 &&
    !Number.isNaN(new Date(v))
  ) {
    return new Date(v)
  }

  return v
}

// eslint-disable-next-line import/prefer-default-export
export const deepCopy = <T>(x: T): T =>
  JSON.parse(JSON.stringify(x, to), from) as T
