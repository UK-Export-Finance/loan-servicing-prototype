import {
  CalculateInterestStrategyName,
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

export const allPlaceholders: { [key: string]: string } = {
  ...interestStrategyNames,
  ...repaymentsStrategyNames,
}

export const placeholderToString = (placeholderName: string): string =>
  allPlaceholders[placeholderName] ?? placeholderName
