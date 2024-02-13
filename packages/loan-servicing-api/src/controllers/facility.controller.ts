import { Controller, Get, Post } from '@nestjs/common'
import Facility from 'models/interfaces/facility'
import FacilityService from 'services/facility.service'

@Controller('/facility')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get()
  async getFacility(): Promise<Facility[]> {
    const allEvents = await this.facilityService.getFacility()
    return allEvents.map(x => x.eventData)
  }

  @Post()
  async newFacility(): Promise<Facility> {
    const newFacility = await this.facilityService.createNewFacility()
    return newFacility
  }
}

export default FacilityController
