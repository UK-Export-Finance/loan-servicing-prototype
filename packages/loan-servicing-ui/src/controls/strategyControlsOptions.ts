import { CalculateInterestStrategyName } from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export const filterSelectOptions = <T extends string>(
  availableOptions: NunjuckSelectInputOption<T>[],
  permittedValues: T[],
): NunjuckSelectInputOption<T>[] =>
  availableOptions.filter((opt) => permittedValues.includes(opt.value))

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
