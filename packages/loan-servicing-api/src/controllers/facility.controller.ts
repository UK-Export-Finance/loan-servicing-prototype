import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import {
  FacilityIncrementableProperties,
  LoanServicingEvent,
} from 'loan-servicing-common'
import { UntypedEvent } from 'models/dtos/event'
import {
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
  UpdateFacilityRequestDtoClass,
} from 'models/dtos/facility'
import EventEntity from 'models/entities/EventEntity'
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
    if (facility === null) {
      throw new NotFoundException()
    }
    return facility
  }

  @Get('events')
  @ApiOkResponse({ type: UntypedEvent })
  async getFacilityEvents(
    @Query('id') streamId: string,
  ): Promise<EventEntity<LoanServicingEvent>[]> {
    const facilityEvents =
      await this.facilityService.getFacilityEvents(streamId)
    if (facilityEvents === null) {
      throw new NotFoundException()
    }
    return facilityEvents
  }

  @Get('all')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async getAllFacility(): Promise<FacilityResponseDtoClass[] | null> {
    const allEvents = await this.facilityService.getAllFacilities()
    if (allEvents === null) {
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
    const updatedFacility = await this.facilityService.updateFacility(
      id,
      Number(version),
      body,
    )
    return updatedFacility
  }

  @Post('increment')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async incrementValue(
    @Query('id') id: string,
    @Query('version') version: string,
    @Query('property') property: FacilityIncrementableProperties,
    @Query('increment') increment: string,
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.incrementFacilityValue(
      id,
      Number(version),
      property,
      parseFloat(increment),
    )
    return updatedFacility
  }
}

export default FacilityController
