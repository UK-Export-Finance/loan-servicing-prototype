import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common'
import { Facility } from 'loan-servicing-common'
import {
  NewFacilityRequestDtoClass,
  UpdateFacilityRequestDtoClass,
} from 'models/requests/facility'
import FacilityService from 'services/facility.service'

@Controller('/facility')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get()
  async getFacility(@Query('id') streamId: string): Promise<Facility | null> {
    const allEvents = await this.facilityService.getFacility(streamId)
    return allEvents
  }

  @Get('all')
  async getAllFacility(): Promise<Facility[] | null> {
    const allEvents = await this.facilityService.getAllFacilities()
    return allEvents
  }

  @Post()
  async newFacility(
    @Body() body: NewFacilityRequestDtoClass,
  ): Promise<Facility> {
    const newFacility = await this.facilityService.createNewFacility(body)
    return newFacility
  }

  @Put()
  async updateFacility(
    @Query('id') id: string,
    @Body() body: UpdateFacilityRequestDtoClass,
  ): Promise<Facility> {
    const updatedFacility = await this.facilityService.updateFacility(id, body)
    return updatedFacility
  }
}

export default FacilityController
