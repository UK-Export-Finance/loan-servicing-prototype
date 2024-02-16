import { Body, Controller, Get, NotFoundException, Post, Put, Query } from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import {
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
  UpdateFacilityRequestDtoClass,
} from 'models/dtos/facility'
import FacilityService from 'services/facility.service'

@ApiTags('Facility')
@Controller('/facility')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get()
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async getFacility(
    @Query('id') streamId: string,
  ): Promise<FacilityResponseDtoClass> {
    const facility = await this.facilityService.getFacility(streamId)
    if(facility === null){
      throw new NotFoundException()
    }
    return facility
  }

  @Get('all')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async getAllFacility(): Promise<FacilityResponseDtoClass[] | null> {
    const allEvents = await this.facilityService.getAllFacilities()
    if(allEvents === null){
      throw new NotFoundException()
    }
    return allEvents
  }

  @Post()
  @ApiCreatedResponse({ type: FacilityResponseDtoClass })
  async newFacility(
    @Body() body: NewFacilityRequestDtoClass,
  ): Promise<FacilityResponseDtoClass> {
    const newFacility = await this.facilityService.createNewFacility(body)
    return newFacility
  }

  @Put()
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async updateFacility(
    @Query('id') id: string,
    @Query('version') version: string,
    @Body() body: UpdateFacilityRequestDtoClass,
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.updateFacility(id, Number(version), body)
    return updatedFacility
  }

  @Post('incrementFacilityAmount')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async incrementFacilityValue(
    @Query('id') id: string,
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.incrementFacilityValue(id)
    return updatedFacility
  }
}

export default FacilityController
