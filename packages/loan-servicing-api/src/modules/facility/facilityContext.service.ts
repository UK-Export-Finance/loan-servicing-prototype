import { Injectable } from '@nestjs/common'
import createFacilityContext, {
  FacilityContext,
} from 'facilityStrategies/facilityContext'

@Injectable()
class FacilityContextService {
  getContextForFacilityType(): FacilityContext {
    return createFacilityContext()
  }
}

export default FacilityContextService
