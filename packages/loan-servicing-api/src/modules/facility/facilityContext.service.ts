import { Injectable } from '@nestjs/common'
import { FacilityContextOptions } from 'modules/strategy/strategy.service'

@Injectable()
class FacilityContextService {
  getContextForFacilityType(): FacilityContextOptions {
    const contextOptions: FacilityContextOptions = {
      calculateInterestStrategy: 'Compounding',
    }
    return contextOptions
  }
}

export default FacilityContextService
