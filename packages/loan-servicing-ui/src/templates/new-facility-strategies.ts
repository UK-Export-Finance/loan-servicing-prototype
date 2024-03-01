import {
  CalculateInterestStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type ConfigureFacilityStrategiesNjkInput = {
  calculateInterestStrategyNames: NunjuckSelectInputOption<CalculateInterestStrategyName>[]
  repaymentStrategyNames: NunjuckSelectInputOption<RepaymentStrategyName>[]
  facilityType: string
}
