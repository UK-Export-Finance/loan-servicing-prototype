import { ClassConstructor } from 'class-transformer'
import { EventTypes, LoanServicingEvent } from 'loan-servicing-common'
import {
  AdjustFacilityAmountDtoClass,
  NewFacilityRequestDtoClass,
} from './facility'
import {
  AddWithdrawalToDrawingDtoClass,
  NewDrawingRequestDtoClass,
  UpdateInterestRequestDtoClass,
} from './drawing'

const eventTypeToEventClassDefinition: {
  [key in EventTypes]: ClassConstructor<
    Extract<LoanServicingEvent, { type: key }>['eventData']
  >
} = {
  CreateNewFacility: NewFacilityRequestDtoClass,
  UpdateInterest: UpdateInterestRequestDtoClass,
  AdjustFacilityAmount: AdjustFacilityAmountDtoClass,
  WithdrawFromDrawing: AddWithdrawalToDrawingDtoClass,
  CreateNewDrawing: NewDrawingRequestDtoClass,
}

export default eventTypeToEventClassDefinition
