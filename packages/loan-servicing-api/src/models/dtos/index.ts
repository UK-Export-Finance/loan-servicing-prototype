import { ClassConstructor } from 'class-transformer'
import { LoanServicingEvent } from 'loan-servicing-common'
import {
  AddDrawingToFacilityClass,
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
  [key in LoanServicingEvent['type']]: ClassConstructor<
    Extract<LoanServicingEvent, { type: key }>['eventData']
  >
} = {
  CreateNewFacility: NewFacilityRequestDtoClass,
  UpdateInterest: UpdateInterestRequestDtoClass,
  AdjustFacilityAmount: AdjustFacilityAmountDtoClass,
  WithdrawFromDrawing: AddWithdrawalToDrawingDtoClass,
  CreateNewDrawing: NewDrawingRequestDtoClass,
  RevertWithdrawal: RevertWithdrawalDtoClass,
  AddDrawingToFacility: AddDrawingToFacilityClass,
}

export default eventTypeToEventClassDefinition
