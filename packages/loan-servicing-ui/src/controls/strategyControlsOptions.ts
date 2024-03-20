import {
  FacilityFeeStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'
import {
  facilityFeeStrategyNames,
  repaymentsStrategyNames,
} from 'strings/strategyNames'

export const filterSelectOptions = <T extends string>(
  availableOptions: NunjuckSelectInputOption<T>[],
  permittedValues: T[],
): NunjuckSelectInputOption<T>[] =>
  availableOptions.filter((opt) => permittedValues.includes(opt.value))

export const buildSelectOptionsFromStrings = <T extends string>(
  stringRecord: Record<T, string>,
): NunjuckSelectInputOption<T>[] => {
  const entries = Object.entries(stringRecord) as [T, string][]
  return entries.map(([value, text]) => ({ value, text }))
}

export const repaymentsSelectOptions: NunjuckSelectInputOption<RepaymentStrategyName>[] =
  buildSelectOptionsFromStrings(repaymentsStrategyNames)

export const facilityFeeSelectOptions: NunjuckSelectInputOption<FacilityFeeStrategyName>[] =
  buildSelectOptionsFromStrings(facilityFeeStrategyNames)
