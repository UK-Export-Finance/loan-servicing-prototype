import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { LoanServicingEvent } from 'loan-servicing-common'
import { UntypedEvent } from 'models/dtos/event'
import {
  AdjustFacilityAmountDtoClass,
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
} from 'models/dtos/facility'
import FacilityService from 'modules/facility/facility.service'

@ApiTags('Facility')
@Controller('/facility')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get(':facilityId')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async getFacility(
    @Param('facilityId') facilityStreamId: string,
  ): Promise<FacilityResponseDtoClass> {
    const facility = await this.facilityService.getFacility(facilityStreamId)
    if (facility === null) {
      throw new NotFoundException()
    }
    return facility
  }

  @Get(':facilityId/events')
  @ApiOkResponse({ type: UntypedEvent })
  async getFacilityEvents(
    @Param('facilityId') facilityStreamId: string,
  ): Promise<LoanServicingEvent[]> {
    const facilityEvents =
      await this.facilityService.getFacilityEvents(facilityStreamId)
    if (facilityEvents === null) {
      throw new NotFoundException()
    }
    return facilityEvents
  }

  @Get()
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async getAllFacility(): Promise<FacilityResponseDtoClass[] | null> {
    const allEvents = await this.facilityService.getAllFacilities()
    if (allEvents === null) {
      throw new NotFoundException()
    }
    return allEvents
  }

  @Post('new')
  @ApiCreatedResponse({ type: FacilityResponseDtoClass })
  async newFacility(
    @Body() body: NewFacilityRequestDtoClass,
  ): Promise<FacilityResponseDtoClass> {
    const newFacility = await this.facilityService.createNewFacility(body)
    return newFacility
  }

  @Post(':facilityId/adjustPrincipal')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async incrementValue(
    @Param('facilityId') facilityId: string,
    @Query('version') version: string,
    @Body() adjustment: AdjustFacilityAmountDtoClass,
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.adjustFacilityAmount(
      facilityId,
      Number(version),
      adjustment,
    )
    return updatedFacility
  }
}

export default FacilityController
