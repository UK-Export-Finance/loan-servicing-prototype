export type WrapPropertyInPromise<T extends object, K extends keyof T> = Omit<
  T,
  K
> & { [key in keyof T]: key extends K ? Promise<T[key]> : T[key] }
