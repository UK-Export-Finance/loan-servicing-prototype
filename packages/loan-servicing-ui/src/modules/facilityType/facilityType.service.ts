import { Injectable } from '@nestjs/common'
import { putApiData, tryGetApiData } from 'api/base-client'
import { FacilityType } from 'loan-servicing-common'

@Injectable()
class FacilityTypeService {
  async createFacilityType(
    facility: FacilityType,
  ): Promise<FacilityType | null> {
    const newFacility = await putApiData<FacilityType>(
      'facility-type',
      facility,
    )
    return newFacility
  }

  async getFacilityType(name: string): Promise<FacilityType | null> {
    const facility = await tryGetApiData<FacilityType>(`facility-type/${name}`)
    return facility
  }
}

export default FacilityTypeService
