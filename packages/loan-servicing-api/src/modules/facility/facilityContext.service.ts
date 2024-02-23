import { Injectable } from '@nestjs/common'
import { FacilityStrategyOptions } from 'modules/strategy/strategyOptions.provider'

@Injectable()
class FacilityContextService {
  getContextForFacilityType(): FacilityStrategyOptions {
    const contextOptions: FacilityStrategyOptions = {
      calculateInterestStrategy: 'Compounding',
    }
    return contextOptions
  }
}

export default FacilityContextService
