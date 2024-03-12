import Big, { roundHalfEven as ROUND_MODE_HALF_EVEN } from 'big.js'

// eslint-disable-next-line import/prefer-default-export
export const calculateAccrual = (
  amount: string | Big,
  rate: string | Big,
): string => {
  const dailyRate = Big(rate).div(100).div(365)
  const amountAccrued = Big(amount)
    .times(dailyRate)
    .round(2, ROUND_MODE_HALF_EVEN)
    .toFixed(2)
  return amountAccrued
}
