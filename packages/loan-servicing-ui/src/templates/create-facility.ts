import { CalculateInterestStrategyName } from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type CreateFacilityNjkInput = {
  calculateInterestStrategyNames: NunjuckSelectInputOption<CalculateInterestStrategyName>[]
  facilityType: string
}

export const calculateInterestSelectOptions: NunjuckSelectInputOption<CalculateInterestStrategyName>[] =
  [
    {
      value: 'NoInterest',
      text: 'Interest Free',
    },
    {
      value: 'PrincipalOnly',
      text: 'On Principal Only',
    },
    {
      value: 'Compounding',
      text: 'Compounding',
    },
  ]
