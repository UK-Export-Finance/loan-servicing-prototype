import {
  CalculateInterestStrategyName,
  DrawingWithSpecifiedConfig,
} from 'loan-servicing-common'
import Big from 'big.js'
import { calculateAccrual } from 'maths/accrualCalculations'

export type CalculateInterestStrategy<T extends CalculateInterestStrategyName> =
  (
    facility: DrawingWithSpecifiedConfig<'calculateInterestStrategy', T>,
  ) => string

export const calculateNoInterest: CalculateInterestStrategy<
  'NoInterest'
> = () => '0'

export const calculatePrincipalOnlyInterest: CalculateInterestStrategy<
  'PrincipalOnly'
> = ({ outstandingPrincipal, interestRate }) =>
  calculateAccrual(outstandingPrincipal, interestRate)

export const calculateCompoundingInterest: CalculateInterestStrategy<
  'Compounding'
> = ({
  outstandingPrincipal: facilityAmount,
  interestRate,
  interestAccrued,
}) => {
  const accruableTotal = Big(facilityAmount).add(interestAccrued)
  return calculateAccrual(accruableTotal, interestRate)
}

type CalculateInterestStrategies = {
  [K in CalculateInterestStrategyName]: CalculateInterestStrategy<K>
}

const calculateInterestStrategies: CalculateInterestStrategies = {
  NoInterest: calculateNoInterest,
  PrincipalOnly: calculatePrincipalOnlyInterest,
  Compounding: calculateCompoundingInterest,
}

export default calculateInterestStrategies
