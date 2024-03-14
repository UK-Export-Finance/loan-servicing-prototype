import { ClassConstructor } from 'class-transformer'
import {
  AddDrawingAccrualEvent,
  AddFacilityFeeEvent,
  LoanServicingEvent,
  SetDrawingRepaymentsEvent,
} from 'loan-servicing-common'
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
import {
  ManualRepaymentStrategyOptionsDtoClass,
  RegularRepaymentStrategyOptionsDtoClass,
} from './drawingConfiguration'
import {
  FixedLoanInterestAccrualStrategyOptionDtoClass,
  MarketLoanInterestAccrualStrategyOptionDtoClass,
} from './drawingAccrual'

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
  AddDrawingAccrual: (event: AddDrawingAccrualEvent) => {
    switch (event.eventData.name) {
      case 'FixedLoanInterestAccrual':
        return FixedLoanInterestAccrualStrategyOptionDtoClass
      case 'MarketLoanInterestAccrual':
        return MarketLoanInterestAccrualStrategyOptionDtoClass
      default:
        throw new NotImplementedException('Add facility event not supported')
    }
  },
  SetDrawingRepayments: (event: SetDrawingRepaymentsEvent) => {
    switch (event.eventData.name) {
      case 'Regular':
        return RegularRepaymentStrategyOptionsDtoClass
      case 'Manual':
        return ManualRepaymentStrategyOptionsDtoClass
      default:
        throw new NotImplementedException(
          'Set drawing repayment schedule not supported',
        )
    }
  },
}

export default eventTypeToEventClassDefinition
