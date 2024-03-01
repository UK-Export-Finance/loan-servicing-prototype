import {
  CalculateInterestStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'
import {
  interestStrategyNames,
  repaymentsStrategyNames,
} from 'strings/strategyNames'

export const filterSelectOptions = <T extends string>(
  availableOptions: NunjuckSelectInputOption<T>[],
  permittedValues: T[],
): NunjuckSelectInputOption<T>[] =>
  availableOptions.filter((opt) => permittedValues.includes(opt.value))

const buildSelectOptionsFromStrings = <T extends string>(
  stringRecord: Record<T, string>,
): NunjuckSelectInputOption<T>[] => {
  const entries = Object.entries(stringRecord) as [T, string][]
  return entries.map(([value, text]) => ({ value, text }))
}

export const calculateInterestSelectOptions: NunjuckSelectInputOption<CalculateInterestStrategyName>[] =
  buildSelectOptionsFromStrings(interestStrategyNames)

export const repaymentsSelectOptions: NunjuckSelectInputOption<RepaymentStrategyName>[] =
  buildSelectOptionsFromStrings(repaymentsStrategyNames)
