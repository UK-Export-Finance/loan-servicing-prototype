import { Injectable } from '@nestjs/common'
import {
  CalculateFacilityFeeEvent,
  Facility,
  FacilityFeeStrategyName,
  FacilityWithSpecifiedConfig,
} from 'loan-servicing-common'
import { facilityFeeEventStrategies } from './generate-events.strategies'
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

  generateFacilityFeeEvents = <T extends FacilityFeeStrategyName>(
    facility: FacilityWithSpecifiedConfig<'facilityFeeStrategy', T>,
  ): CalculateFacilityFeeEvent[] => {
    const option = facility.facilityConfig.facilityFeeStrategy
    const strategyName: T = option.name
    return facilityFeeEventStrategies[strategyName](facility)
  }
}

export default FacilityFeeService
