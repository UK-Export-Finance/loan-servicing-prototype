import { DrawingDto } from 'loan-servicing-common'
import {
  EventTableProps,
  TransactionTableProps,
} from 'templates/macros/transaction-tables'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type ChangeInterestNjkInput = {
  drawing: DrawingDto
} & EventTableProps &
  TransactionTableProps

export type FacilityInterestRateUpdateFormDto = {
  interestRate: string
} & MandatoryDateInputFormData<'effectiveDate'>
