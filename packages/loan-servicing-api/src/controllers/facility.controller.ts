import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
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
import FacilityTransactionService from 'services/facilityTransaction.service'

@ApiTags('Facility')
@Controller('/facility')
class FacilityController {
  constructor(
    private facilityService: FacilityService,
    private transactionService: FacilityTransactionService,
  ) {}

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
  @ApiQuery({ name: 'eventEffectiveDate', required: false })
  async newFacility(
    @Body() body: NewFacilityRequestDtoClass,
    @Query('eventEffectiveDate') eventEffectiveDate: Date = new Date(),
  ): Promise<FacilityResponseDtoClass> {
    const newFacility = await this.facilityService.createNewFacility(
      body,
      eventEffectiveDate,
    )
    return newFacility
  }

  @Put()
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  @ApiQuery({ name: 'eventEffectiveDate', required: false })
  async updateFacility(
    @Query('id') id: string,
    @Query('version') version: number,
    @Body() body: UpdateFacilityRequestDtoClass,
    @Query('eventEffectiveDate') eventEffectiveDate: Date = new Date(),
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.updateFacility(
      id,
      Number(version),
      body,
      eventEffectiveDate,
    )
    return updatedFacility
  }

  @Get('build')
  async buildTransactions(@Query('id') id: string): Promise<void> {
    return this.transactionService.buildTransactions(id)
  }

  @Post('increment')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  @ApiQuery({ name: 'eventEffectiveDate', required: false })
  async incrementValue(
    @Query('id') id: string,
    @Query('version') version: string,
    @Query('property') property: FacilityIncrementableProperties,
    @Query('increment') increment: string,
    @Query('eventEffectiveDate') eventEffectiveDate: Date = new Date(),
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.incrementFacilityValue(
      id,
      Number(version),
      property,
      parseFloat(increment),
      eventEffectiveDate,
    )
    return updatedFacility
  }
}

export default FacilityController
