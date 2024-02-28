import { CalculateInterestStrategyName } from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type CreateFacilityNjkInput = {
  calculateInterestStrategyNames: NunjuckSelectInputOption<CalculateInterestStrategyName>[]
  facilityType: string
}


