import { CalculateInterestStrategyName } from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type CreateFacilityTypeNjkInput = {
  calculateInterestSelectOptions: NunjuckSelectInputOption<CalculateInterestStrategyName>[]
}

export type CreateFacilityTypeFormOutput = {
  name: string
  interestStrategies: CalculateInterestStrategyName[]
}
