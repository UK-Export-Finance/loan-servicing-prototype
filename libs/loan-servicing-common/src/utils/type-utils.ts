export type PropertiesWithType<T extends object, ValueType> = keyof {
  [P in keyof T as T[P] extends ValueType | undefined ? P : never]: T[P]
}

export type MapAllTypeAtoTypeB<Subject, A, B> = {
  [k in keyof Subject]: Subject[k] extends A ? B : Subject[k]
}

export type ConvertToDtoType<T> = MapAllTypeAtoTypeB<T, Date, string>

export type ConvertToFormType<T> = MapAllTypeAtoTypeB<
  ConvertToDtoType<T>,
  number,
  string
>

export type ReplaceProperty<
  Object extends object,
  KeyToReplace extends keyof Object,
  NewType,
> = Omit<Object, KeyToReplace> & { [k in KeyToReplace]: NewType }

export type FlattenByKey<T, K extends keyof T> = Omit<T, K> & T[K]

export type PartialByKey<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>

export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
    ? T
    : T extends object
      ? DeepReadonlyObject<T>
      : T

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type NonNestedValues<T extends object> = {
  [key in keyof T as T[key] extends string | number | boolean | Date
    ? key
    : never]: T[key]
}

// Use this type to force Intellisense to show the computed type
// instead of type aliases.
// eslint-disable-next-line @typescript-eslint/naming-convention
export type DEBUG_FlattenType<T> = T extends object
  ? { [K in keyof T]: DEBUG_FlattenType<T[K]> }
  : T
