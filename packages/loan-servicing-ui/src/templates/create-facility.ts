import { CalculateInterestStrategyName, RepaymentStrategyName } from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'
import { MapDatesToDateFormInputs } from 'utils/form-helpers'

export type CreateFacilityNjkInput = {
  calculateInterestStrategyNames: NunjuckSelectInputOption<CalculateInterestStrategyName>[]
  repaymentStrategyNames: NunjuckSelectInputOption<RepaymentStrategyName>[]
  facilityType: string
}

export type NewFacilityRequestFormDto = MapDatesToDateFormInputs<
  {
    obligor: string
    calculateInterestStrategy: CalculateInterestStrategyName
    facilityAmount: string
    repaymentStrategy: RepaymentStrategyName
    repaymentStartDate: Date
    repaymentInterval: string
    interestRate: string
    issuedEffectiveDate: Date
    expiryDate: Date
  },
  'expiryDate' | 'issuedEffectiveDate' | 'repaymentStartDate'
>


