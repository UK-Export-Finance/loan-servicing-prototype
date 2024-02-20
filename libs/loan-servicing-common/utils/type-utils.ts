export type PropertiesWithType<T extends object, ValueType> = keyof {
  [P in keyof T as T[P] extends ValueType | undefined ? P : never]: T[P]
}

export type MapAllTypeAtoTypeB<Subject, A, B> = {
  [k in keyof Subject]: Subject[k] extends A ? B : Subject[k]
}

export type ConvertToDtoType<T> = MapAllTypeAtoTypeB<T, Date, string>

// eslint-disable-next-line @typescript-eslint/naming-convention
export type DEBUG_FlattenType<T> = T extends object
  ? { [K in keyof T]: DEBUG_FlattenType<T[K]> }
  : T
