import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common'
import { Facility, FacilityUpdateRequestDto } from 'loan-servicing-common'
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
  async newFacility(@Body() body: FacilityUpdateRequestDto): Promise<Facility> {
    const newFacility = await this.facilityService.createNewFacility(body)
    return newFacility
  }

  @Put()
  async updateFacility(@Query('id') id: string, @Body() body: Partial<FacilityUpdateRequestDto>): Promise<Facility> {
    const updatedFacility = await this.facilityService.updateFacility(id, body)
    return updatedFacility
  }
}

export default FacilityController
