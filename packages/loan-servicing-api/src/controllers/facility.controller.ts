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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { LoanServicingEvent, FacilityTransaction } from 'loan-servicing-common'
import { UntypedEvent } from 'models/dtos/event'
import {
  AdjustFacilityPrincipalDtoClass,
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
  UpdateInterestRequestDtoClass,
} from 'models/dtos/facility'
import EventEntity from 'models/entities/EventEntity'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import FacilityService from 'services/facility.service'
import FacilityProjectionsService from 'services/facilityProjections.service'

@ApiTags('Facility')
@Controller('/facility')
class FacilityController {
  constructor(
    private facilityService: FacilityService,
    private transactionService: FacilityProjectionsService,
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

  @Get('transactions')
  @ApiOkResponse({ type: FacilityTransactionEntity })
  async getFacilityTransactions(
    @Query('id') streamId: string,
  ): Promise<FacilityTransaction[]> {
    const facilityEvents =
      await this.transactionService.getTransactions(streamId)
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

  @Post(':id/:version/updateInterestRate')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  @ApiQuery({ name: 'eventEffectiveDate', required: false })
  async updateFacilityInterestRate(
    @Query('id') id: string,
    @Query('version') version: number,
    @Body() body: UpdateInterestRequestDtoClass,
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
    await this.transactionService.buildProjections(id)
  }

  @Post(':id/:version/adjustPrincipal')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async incrementValue(
    @Param('id') id: string,
    @Param('version') version: string,
    @Body() adjustment: AdjustFacilityPrincipalDtoClass,
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.adjustFacilityPrincipal(
      id,
      Number(version),
      adjustment,
    )
    return updatedFacility
  }
}

export default FacilityController
