import { Injectable } from '@nestjs/common'
import {
  CalculateFacilityFeeEvent,
  Facility,
  FacilityFeeStrategyOption,
} from 'loan-servicing-common'
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
    facility: Facility,
    event: T,
  ): string {
    const handler = calculateFacilityFeeStrategies[
      event.type
    ] as CalculateFacilityFeeStrategy<T>
    return handler(facility, event)
  }

  generateFacilityFeeEvents = (
    facility: Facility,
  ): CalculateFacilityFeeEvent[] =>
    facility.facilityConfig.facilityFeesStrategies.flatMap((option) =>
      this.generateEventsForSingleFee(facility, option),
    )

  private generateEventsForSingleFee = <T extends FacilityFeeStrategyOption>(
    facility: Facility,
    option: T,
  ): CalculateFacilityFeeEvent[] => {
    const strategyName = option.name
    const eventGenerator = facilityFeeEventStrategies[
      strategyName
    ] as GetFacilityFeeEventsStrategy<T>
    return eventGenerator(facility, option)
  }
}

export default FacilityFeeService
