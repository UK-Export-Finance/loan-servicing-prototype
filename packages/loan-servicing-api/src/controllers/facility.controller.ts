import { Controller, Get, Post } from '@nestjs/common'
import BaseEvent from 'models/events/BaseEvent'
import FacilityService from 'services/facility.service'

@Controller('/facility')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get()
  async getFacility(): Promise<BaseEvent[]> {
    const allEvents = await this.facilityService.getFacility()
    return allEvents.map(x => x.eventData)
  }

  @Post()
  async newFacility(): Promise<BaseEvent> {
    const newFacility = await this.facilityService.createNewFacility()
    return newFacility
  }
}

export default FacilityController
