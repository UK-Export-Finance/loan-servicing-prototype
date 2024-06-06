import { ClassConstructor } from 'class-transformer'
import { LoanServicingEvent } from 'loan-servicing-common'
import { NotImplementedException } from '@nestjs/common'
import {
  AdjustFacilityAmountDtoClass,
  NewFacilityRequestDtoClass,
} from './facility'
import {
  AddWithdrawalToDrawingDtoClass,
  NewDrawingRequestDtoClass,
  RevertWithdrawalDtoClass,
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
  FixedDrawingAccrualStrategyOptionDtoClass,
  MarketDrawingAccrualStrategyOptionDtoClass,
  RecordDrawingAccrualPaymentDtoClass,
} from './drawingAccrual'
import { RecordDrawingRepaymentDtoClass } from './drawingRepayment'
import {
  NewParticipationOnFacilityClass,
  NewParticipationRequestDtoClass,
} from './participation'

export type GetClassConstructorForEventData<
  T extends LoanServicingEvent['eventData'],
> = (event: T) => ClassConstructor<T>

const eventTypeToEventClassDefinition: {
  [key in LoanServicingEvent['type']]: GetClassConstructorForEventData<
    Extract<LoanServicingEvent, { type: key }>['eventData']
  >
} = {
  // Events
  CreateNewFacility: () => NewFacilityRequestDtoClass,
  AdjustFacilityAmount: () => AdjustFacilityAmountDtoClass,
  WithdrawFromDrawing: () => AddWithdrawalToDrawingDtoClass,
  CreateNewDrawing: () => NewDrawingRequestDtoClass,
  AddDrawingToFacility: () => NewDrawingRequestDtoClass,
  RevertWithdrawal: () => RevertWithdrawalDtoClass,
  RecordDrawingRepayment: () => RecordDrawingRepaymentDtoClass,
  RecordDrawingAccrualPayment: () => RecordDrawingAccrualPaymentDtoClass,
  CreateNewParticipation: () => NewParticipationRequestDtoClass,
  AddParticipationToFacility: () => NewParticipationOnFacilityClass,
  AddFacilityFee: (eventData) => {
    switch (eventData.name) {
      case 'AccruingFacilityFee':
        return AccruingFacilityFeeStrategyOptionDtoClass
      case 'FixedFacilityFee':
        return FixedFacilityFeeStrategyOptionDtoClass
      default:
        throw new NotImplementedException('Add facility event not supported')
    }
  },
  AddDrawingAccrual: (eventData) => {
    switch (eventData.name) {
      case 'FixedDrawingAccrual':
        return FixedDrawingAccrualStrategyOptionDtoClass
      case 'MarketDrawingAccrual':
        return MarketDrawingAccrualStrategyOptionDtoClass
      default:
        throw new NotImplementedException('Add facility event not supported')
    }
  },
  SetDrawingRepayments: (eventData) => {
    switch (eventData.name) {
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
  // ProjectedEvents
  // CalculateAccruingFacilityFee: () => {throw new NotImplementedException()},
  // CalculateFixedFacilityFee: () => {throw new NotImplementedException()},
  // CalculateFixedDrawingAccrual: () => {throw new NotImplementedException()},
  // CalculateMarketDrawingAccrual: () => {throw new NotImplementedException()},
}

export default eventTypeToEventClassDefinition
