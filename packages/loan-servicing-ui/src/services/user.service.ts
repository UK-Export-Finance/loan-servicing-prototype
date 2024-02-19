import { Injectable } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import { Facility, NewFacilityRequestDto } from 'loan-servicing-common'

@Injectable()
class FacilityService {
  async createFacility(facility: NewFacilityRequestDto): Promise<Facility | null> {
    const newFacility = await postApiData<Facility>('facility', facility)
    return newFacility
  }

  async getFacility(streamId: string): Promise<Facility | null> {
    const facility = await tryGetApiData<Facility>(`facility?id=${streamId}`)
    return facility
  }
}

export default FacilityService
