import {
  AccruingFacilityFeeStrategyOption,
  DrawingAccrualStrategyName,
  FacilityFeeStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'

export const drawingAccrualStrategyNames: Record<
  DrawingAccrualStrategyName,
  string
> = {
  FixedDrawingAccrual: 'Fixed Rate Accrual',
  MarketDrawingAccrual: 'Market linked rate accrual',
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
  ...drawingAccrualStrategyNames,
  ...facilityFeeStrategyNames,
  ...accruingFacilityFeeTypes,
  ...repaymentsStrategyNames,
}

export const placeholderToString = (placeholderName: string): string =>
  allPlaceholders[placeholderName] ?? placeholderName
