export type StrategyOptionsBase<Name extends string, Options extends object> = {
  name: Name
} & Options
