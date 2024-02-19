import { Injectable } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import { Event, Facility, NewFacilityRequestDto } from 'loan-servicing-common'

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

  async getFacilityEvents(streamId:string): Promise<Event[] | null> {
    const events = await tryGetApiData<Event[]>(`facility/events?id=${streamId}`)
    return events
  }
}

export default FacilityService
