import { ClassConstructor } from 'class-transformer'
import { LoanServicingEvent, eventTypeNames } from 'loan-servicing-common'
import {
  AdjustFacilityAmountDtoClass,
  NewFacilityRequestDtoClass,
} from './facility'
import {
  AddWithdrawalToDrawingDtoClass,
  NewDrawingRequestDtoClass,
  RevertWithdrawalDtoClass,
  UpdateInterestRequestDtoClass,
} from './drawing'

const eventTypeToEventClassDefinition: {
  [key in typeof eventTypeNames[number]]: ClassConstructor<
    Extract<LoanServicingEvent, { type: key }>['eventData']
  >
} = {
  CreateNewFacility: NewFacilityRequestDtoClass,
  UpdateInterest: UpdateInterestRequestDtoClass,
  AdjustFacilityAmount: AdjustFacilityAmountDtoClass,
  WithdrawFromDrawing: AddWithdrawalToDrawingDtoClass,
  CreateNewDrawing: NewDrawingRequestDtoClass,
  RevertWithdrawal: RevertWithdrawalDtoClass
}

export default eventTypeToEventClassDefinition
