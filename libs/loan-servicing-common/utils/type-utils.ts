export type ObjectKeysForType<T extends object, ValueType> = keyof {
    [P in keyof T as T[P] extends ValueType | undefined ? P : never]: T[P]
  }