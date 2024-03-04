import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import {
  LoanServicingEvent,
} from 'loan-servicing-common'
import { UntypedEvent } from 'models/dtos/event'
import {
  AdjustFacilityAmountDtoClass,
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
} from 'models/dtos/facility'
import FacilityService from 'modules/facility/facility.service'
import FacilityProjectionsService from 'modules/facility/facility.service.projections'

@ApiTags('Facility')
@Controller('/facility')
class FacilityController {
  constructor(
    private facilityService: FacilityService,
    private transactionService: FacilityProjectionsService,
  ) {}

  @Get(':id')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async getFacility(
    @Param('id') streamId: string,
  ): Promise<FacilityResponseDtoClass> {
    const facility = await this.facilityService.getFacility(streamId)
    if (facility === null) {
      throw new NotFoundException()
    }
    return facility
  }

  @Get(':id/events')
  @ApiOkResponse({ type: UntypedEvent })
  async getFacilityEvents(
    @Param('id') streamId: string,
  ): Promise<LoanServicingEvent[]> {
    const facilityEvents =
      await this.facilityService.getFacilityEvents(streamId)
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

  @Post(':id/adjustPrincipal')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async incrementValue(
    @Param('id') id: string,
    @Query('version') version: string,
    @Body() adjustment: AdjustFacilityAmountDtoClass,
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.adjustFacilityAmount(
      id,
      Number(version),
      adjustment,
    )
    return updatedFacility
  }
}

export default FacilityController
