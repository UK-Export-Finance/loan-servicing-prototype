import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { Facility, NewFacilityRequestDto } from 'loan-servicing-common'
import { CreateNewFacilityEvent } from 'models/events/facilityEvents'
import FacilityService from 'services/facility.service'

@Controller('/facility')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get()
  async getFacility(
    @Query('id') streamId: string,
  ): Promise<CreateNewFacilityEvent[]> {
    const allEvents = await this.facilityService.getFacilityEvents(streamId)
    return allEvents
  }

  @Post()
  async newFacility(@Body() body: NewFacilityRequestDto): Promise<Facility> {
    const newFacility = await this.facilityService.createNewFacility(body)
    return newFacility
  }
}

export default FacilityController
