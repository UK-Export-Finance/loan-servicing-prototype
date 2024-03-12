import { ClassConstructor } from 'class-transformer'
import { LoanServicingEvent } from 'loan-servicing-common'
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
import {
  AccruingFacilityFeeStrategyOptionDtoClass,
  FixedFacilityFeeStrategyOptionDtoClass,
} from './facilityConfiguration'

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
  AddDrawingToFacility: NewDrawingRequestDtoClass,
  RevertWithdrawal: RevertWithdrawalDtoClass,
  AddFixedFacilityFee: FixedFacilityFeeStrategyOptionDtoClass,
  AddAccruingFacilityFee: AccruingFacilityFeeStrategyOptionDtoClass,
}

export default eventTypeToEventClassDefinition
