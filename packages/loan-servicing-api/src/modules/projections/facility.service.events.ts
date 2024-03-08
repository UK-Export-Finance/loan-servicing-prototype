/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import {
  CreateNewFacilityEvent,
  AdjustFacilityAmountEvent,
  Facility,
  FacilityEvent,
  FacilityProjectedEvent,
  Transaction,
  sortEventByEffectiveDate,
  CalculateFacilityFeeEvent,
} from 'loan-servicing-common'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import {
  EventHandler,
  EventHandlerProps,
  IEventHandlerService,
} from 'types/eventHandler'
import StrategyService from 'modules/strategy/strategy.service'

@Injectable()
class FacilityEventHandlingService
  implements IEventHandlerService<Facility, FacilityProjectedEvent>
{
  constructor(
    @Inject(EventService) private eventService: EventService,
    @Inject(StrategyService) private strategyService: StrategyService,
  ) {}

  getProjectedEvents = async (
    facility: Facility,
  ): Promise<FacilityProjectedEvent[]> => {
    const facilityEvents = (await this.eventService.getEventsInCreationOrder(
      facility.streamId,
    )) as FacilityEvent[]
    const facilityFeeEvents =
      await this.strategyService.getFacilityFeeEvents(facility)

    return [...facilityEvents, ...facilityFeeEvents].sort(
      sortEventByEffectiveDate,
    )
  }

  applyEvent = <T extends FacilityProjectedEvent>(
    eventProps: EventHandlerProps<Facility, T>,
  ): Transaction[] => {
    const mutableTransactions = [...eventProps.transactions]
    const handler = this[eventProps.sourceEvent.type] as EventHandler<
      Facility,
      T
    >
    return handler(eventProps, mutableTransactions)
  }

  CreateNewFacility: EventHandler<Facility, CreateNewFacilityEvent> = (
    { entity, sourceEvent },
    transactions,
  ) => {
    transactions.push({
      streamId: entity.streamId,
      sourceEvent,
      datetime: entity.issuedEffectiveDate,
      reference: 'Facility Created',
      principalChange: '0',
      interestChange: '0',
      balanceAfterTransaction: entity.facilityAmount,
      interestAccrued: '0',
    })
    return transactions
  }

  AdjustFacilityAmount: EventHandler<Facility, AdjustFacilityAmountEvent> = (
    { entity, sourceEvent },
    transactions,
  ) => {
    const { eventData: incrementEvent } = sourceEvent
    entity.facilityAmount = Big(entity.facilityAmount)
      .add(incrementEvent.adjustment)
      .toFixed(2)
    entity.undrawnAmount = Big(entity.undrawnAmount)
      .add(incrementEvent.adjustment)
      .toFixed(2)
    transactions.push({
      streamId: entity.streamId,
      sourceEvent,
      datetime: entity.issuedEffectiveDate,
      reference: 'Facility Amount Updated',
      principalChange: incrementEvent.adjustment,
      interestChange: '0',
      balanceAfterTransaction: entity.facilityAmount,
      interestAccrued: '0',
    })
    return transactions
  }

  CalculateFacilityFee: EventHandler<Facility, CalculateFacilityFeeEvent> = (
    { entity, sourceEvent },
    transactions,
  ) => {
    const feeAmount = this.strategyService.calculateFacilityFee(
      entity,
      sourceEvent,
    )
    entity.facilityFeeBalance = Big(entity.facilityFeeBalance)
      .add(feeAmount)
      .toFixed(2)
    transactions.push({
      streamId: entity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'Facility fees',
      principalChange: '0',
      interestChange: feeAmount,
      balanceAfterTransaction: entity.facilityAmount,
      interestAccrued: entity.facilityFeeBalance,
    })
    return transactions
  }

  CalculateFixedFacilityFee = this.CalculateFacilityFee

  CalculateAccruingFacilityFee = this.CalculateFacilityFee

  applyEventToFacility = (
    event: FacilityEvent,
    facilityEntity: Facility,
  ): void => {
    switch (event.type) {
      case 'CreateNewFacility':
        return
      case 'AdjustFacilityAmount':
        const { eventData: incrementEvent } = event as AdjustFacilityAmountEvent
        facilityEntity.facilityAmount = Big(facilityEntity.facilityAmount)
          .add(incrementEvent.adjustment)
          .toFixed(2)
        return
      default:
        throw new NotImplementedException()
    }
  }
}

export default FacilityEventHandlingService
