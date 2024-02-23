import { Facility } from 'loan-servicing-common'
import Big, { roundHalfEven as ROUND_MODE_HALF_EVEN } from 'big.js'

export type CalculateInterestStrategy = (facility: Facility) => string

export const calculateNoInterest: CalculateInterestStrategy = () => '0'

export const calculatePrincipalOnlyInterest: CalculateInterestStrategy = ({
  facilityAmount,
  interestRate,
}) => {
  const dailyInterestRate = Big(interestRate).div(100).div(365)
  const interestAccrued = Big(facilityAmount)
    .times(dailyInterestRate)
    .round(2, ROUND_MODE_HALF_EVEN)
    .toFixed(2)

  return interestAccrued
}

export const calculateCompoundingInterest: CalculateInterestStrategy = ({
  facilityAmount,
  interestRate,
  interestAccrued,
}) => {
  const dailyInterestRate = Big(interestRate).div(100).div(365)
  const accruableTotal = Big(facilityAmount).add(interestAccrued)
  const newInterestAccrued = Big(accruableTotal)
    .times(dailyInterestRate)
    .round(2, ROUND_MODE_HALF_EVEN)
    .toFixed(2)

  return newInterestAccrued
}
