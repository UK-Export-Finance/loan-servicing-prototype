import { Injectable } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  FacilityType,
} from 'loan-servicing-common'

@Injectable()
class FacilityTypeService {
  async createFacility(
    facility: FacilityType,
  ): Promise<FacilityType | null> {
    const newFacility = await postApiData<FacilityType>('facility-type', facility)
    return newFacility
  }

  async getFacility(name: string): Promise<FacilityType | null> {
    const facility = await tryGetApiData<FacilityType>(`facility-type/${name}`)
    return facility
  }
}

export default FacilityTypeService
