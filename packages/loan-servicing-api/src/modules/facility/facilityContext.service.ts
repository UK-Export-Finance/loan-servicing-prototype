import { Injectable } from '@nestjs/common'
import createFacilityContext, {
  FacilityContext,
  FacilityContextOptions,
} from 'facilityStrategies/facilityContext'

@Injectable()
class FacilityContextService {
  getContextForFacilityType(): FacilityContext {
    const contextOptions: FacilityContextOptions = {
      calculateInterest: 'Compounding',
    }
    return createFacilityContext(contextOptions)
  }
}

export default FacilityContextService
