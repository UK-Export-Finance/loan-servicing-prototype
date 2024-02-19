import { Injectable } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import { LoanServicingEvent, Facility, NewFacilityRequestDto } from 'loan-servicing-common'

@Injectable()
class FacilityService {
  async createFacility(
    facility: NewFacilityRequestDto,
  ): Promise<Facility | null> {
    const newFacility = await postApiData<Facility>('facility', facility)
    return newFacility
  }

  async getFacility(streamId: string): Promise<Facility | null> {
    const facility = await tryGetApiData<Facility>(`facility?id=${streamId}`)
    return facility
  }

  async getFacilityEventTableRows(
    streamId: string,
  ): Promise<{ text: string }[][] | null> {
    const events = await tryGetApiData<LoanServicingEvent[]>(
      `facility/events?id=${streamId}`,
    )
    return (
      events?.map((e) =>
        [e.type, JSON.stringify(e.eventData)].map((c) => ({ text: c })),
      ) || null
    )
  }
}

export default FacilityService
