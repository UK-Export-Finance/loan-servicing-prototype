import { ClassConstructor } from 'class-transformer'
import { AddFacilityFeeEvent, LoanServicingEvent } from 'loan-servicing-common'
import { NotImplementedException } from '@nestjs/common'
import EventEntity from 'models/entities/EventEntity'
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

export type GetClassConstructorForEventData<T extends LoanServicingEvent> = (
  event: EventEntity<T>,
) => ClassConstructor<T['eventData']>

const eventTypeToEventClassDefinition: {
  [key in LoanServicingEvent['type']]: GetClassConstructorForEventData<
    Extract<LoanServicingEvent, { type: key }>
  >
} = {
  CreateNewFacility: () => NewFacilityRequestDtoClass,
  UpdateInterest: () => UpdateInterestRequestDtoClass,
  AdjustFacilityAmount: () => AdjustFacilityAmountDtoClass,
  WithdrawFromDrawing: () => AddWithdrawalToDrawingDtoClass,
  CreateNewDrawing: () => NewDrawingRequestDtoClass,
  AddDrawingToFacility: () => NewDrawingRequestDtoClass,
  RevertWithdrawal: () => RevertWithdrawalDtoClass,
  AddFacilityFee: (event: AddFacilityFeeEvent) => {
    switch (event.eventData.name) {
      case 'AccruingFacilityFee':
        return AccruingFacilityFeeStrategyOptionDtoClass
      case 'FixedFacilityFee':
        return FixedFacilityFeeStrategyOptionDtoClass
      default:
        throw new NotImplementedException('Add facility event not supported')
    }
  },
}

export default eventTypeToEventClassDefinition
