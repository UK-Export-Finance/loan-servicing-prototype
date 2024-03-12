import {
  AccruingFacilityFeeStrategyOption,
  CalculateInterestStrategyName,
  FacilityFeeStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'

export const interestStrategyNames: Record<
  CalculateInterestStrategyName,
  string
> = {
  NoInterest: 'Interest Free',
  PrincipalOnly: 'On Principal Only',
  Compounding: 'Compounding',
}

export const repaymentsStrategyNames: Record<RepaymentStrategyName, string> = {
  Regular: 'Regular Repayments',
  Manual: 'Manual Repayments',
}

export const facilityFeeStrategyNames: Record<FacilityFeeStrategyName, string> =
  {
    AccruingFacilityFee: 'Accruing Facility Fees',
    FixedFacilityFee: 'Fixed Facility Fees',
  }

export const accruingFacilityFeeTypes: Record<
  AccruingFacilityFeeStrategyOption['accruesOn'],
  string
> = {
  drawnAmount: 'Drawn amount',
  facilityAmount: 'Facility amount',
  undrawnAmount: 'Undrawn amount',
}

export const allPlaceholders: { [key: string]: string } = {
  ...interestStrategyNames,
  ...repaymentsStrategyNames,
}

export const placeholderToString = (placeholderName: string): string =>
  allPlaceholders[placeholderName] ?? placeholderName
