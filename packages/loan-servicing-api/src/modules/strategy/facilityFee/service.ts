import { Injectable } from '@nestjs/common'
import {
  CalculateFacilityFeeEvent,
  FacilityFeeStrategyOption,
} from 'loan-servicing-common'
import { ReadonlyInProgressFacility } from 'modules/projections/builders/FacilityBuilder'
import {
  GetFacilityFeeEventsStrategy,
  facilityFeeEventStrategies,
} from './generate-events.strategies'
import calculateFacilityFeeStrategies, {
  CalculateFacilityFeeStrategy,
} from './calculateFee.strategies'

@Injectable()
class FacilityFeeService {
  calculateFee<T extends CalculateFacilityFeeEvent>(
    facility: ReadonlyInProgressFacility,
    event: T,
  ): string {
    const handler = calculateFacilityFeeStrategies[
      event.type
    ] as CalculateFacilityFeeStrategy<T>
    return handler(facility, event)
  }

  generateEventsForSingleFee = <T extends FacilityFeeStrategyOption>(
    facility: ReadonlyInProgressFacility,
    option: T,
  ): CalculateFacilityFeeEvent[] => {
    const generateEvents = facilityFeeEventStrategies[
      option.name
    ] as GetFacilityFeeEventsStrategy<T>
    return generateEvents(facility, option)
  }
}

export default FacilityFeeService
