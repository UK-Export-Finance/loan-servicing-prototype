import { Facility } from 'loan-servicing-common'
import {
  EventTableProps,
} from 'templates/macros/transaction-tables'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AmendPrincipalNjkInput = {
  facility: Facility
} & EventTableProps

export type FacilityPrincipalAdjustmentFormDto = {
  adjustment: string
} & MandatoryDateInputFormData<'effectiveDate'>
