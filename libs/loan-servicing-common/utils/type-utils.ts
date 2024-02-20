export type PropertiesWithType<T extends object, ValueType> = keyof {
  [P in keyof T as T[P] extends ValueType | undefined ? P : never]: T[P]
}

export type MapAllTypeAtoTypeB<Subject, A, B> = {
  [k in keyof Subject]: Subject[k] extends A ? B : Subject[k]
}

export type ConvertToDtoType<T> = MapAllTypeAtoTypeB<T, Date, string>
