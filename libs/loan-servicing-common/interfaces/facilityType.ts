export type CalculateInterestStrategyName =
  | 'NoInterest'
  | 'PrincipalOnly'
  | 'Compounding'

export type FacilityStrategyOptions = {
  calculateInterestStrategy: CalculateInterestStrategyName
}

export type FacilityType = {
  name: string
} & FacilityStrategyOptions
