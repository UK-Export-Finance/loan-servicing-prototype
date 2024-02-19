import { Injectable, NotImplementedException } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  LoanServicingEvent,
  Facility,
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import { EventTableRow } from 'types/events'
import { NunjuckTableRow } from 'types/nunjucks'

const getEventTableRow = (event: LoanServicingEvent): EventTableRow => {
  const { datetime } = event
  const date = new Date(datetime)
  switch (event.type) {
    case 'CreateNewFacility':
      return {
        event: 'Facility created',
        date: date.toLocaleString('en-GB'),
        description: 'Facility created with intial values',
      }
    case 'IncrementFacilityValue':
      const { value, increment } = event.eventData
      return {
        event: 'Facility value incremented',
        date: date.toLocaleString('en-GB'),
        description: `Property '${value}' was ${increment > 0 ? 'increased' : 'decreased'} by ${Math.abs(increment)}.`,
      }
    case 'UpdateFacility':
      const updatedEntries = Object.entries(event.eventData)
      return {
        event: 'Facility property changed',
        date: date.toLocaleString('en-GB'),
        description: updatedEntries
          .map(
            ([property, newValue]) =>
              `Property '${property}' was changed to '${newValue}'.`,
          )
          .join('\n'),
      }
    default:
      throw new NotImplementedException()
  }
}

const tableRowToNunjucksTableRow = (
  r: EventTableRow,
): NunjuckTableRow => [r.date, r.event, r.description].map((c) => ({ text: c }))

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
  ): Promise<NunjuckTableRow[] | null> {
    const events = await tryGetApiData<LoanServicingEvent[]>(
      `facility/events?id=${streamId}`,
    )
    return events?.map(getEventTableRow).map(tableRowToNunjucksTableRow) || null
  }
}

export default FacilityService
