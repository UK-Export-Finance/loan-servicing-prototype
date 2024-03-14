import { DrawingDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AddDrawingAccrualNjkInput = {
  drawing: DrawingDto
}

export type AddFixedDrawingAccrualFormDto = {
  accrualRate: string
} & MandatoryDateInputFormData<'effectiveDate'> &
  MandatoryDateInputFormData<'expiryDate'>

export type AddMarketDrawingAccrualFormDto = {
  accrualRate: string
} & MandatoryDateInputFormData<'effectiveDate'> &
  MandatoryDateInputFormData<'expiryDate'>
