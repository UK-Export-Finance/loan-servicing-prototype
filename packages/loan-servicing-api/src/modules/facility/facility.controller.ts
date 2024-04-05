import {
  BadRequestException,
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
import {
  FacilityResponseDto,
  LoanServicingEvent,
  SummarisedTransaction,
  Transaction,
  TransactionResolution,
} from 'loan-servicing-common'
import { UntypedEventClass } from 'models/dtos/event'
import {
  AdjustFacilityAmountDtoClass,
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
} from 'models/dtos/facility'
import TransactionEntity from 'models/entities/TransactionEntity'
import FacilityService from 'modules/facility/facility.service'
import { plainToInstance } from 'class-transformer'
import {
  AddAccruingFacilityFeeDtoClass,
  AddFixedFacilityFeeDtoClass,
} from 'models/dtos/facilityConfiguration'
import ProjectionsService from 'modules/projections/projections.service'
import FacilityTypeService from 'modules/facilityType/facilityType.service'
import FacilityTransactionService from './facility.transactions.service'

@ApiTags('Facility')
@Controller('/facility')
class FacilityController {
  constructor(
    private facilityService: FacilityService,
    private transactionService: FacilityTransactionService,
    private projectionService: ProjectionsService,
    private facilityTypeService: FacilityTypeService,
  ) {}

  @Get(':facilityId')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async getFacility(
    @Param('facilityId') facilityStreamId: string,
    @Query('rebuild') rebuild?: boolean,
  ): Promise<FacilityResponseDtoClass> {
    const facility = await this.facilityService.getFacility(
      facilityStreamId,
      rebuild,
    )
    if (facility === null) {
      throw new NotFoundException()
    }
    return plainToInstance(FacilityResponseDtoClass, facility, {
      enableCircularCheck: true,
    })
  }

  @Post(':facilityId/rebuild')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async rebuildFacilityProjection(
    @Param('facilityId') facilityStreamId: string,
  ): Promise<FacilityResponseDto> {
    const { facility } =
      await this.projectionService.buildProjectionsForFacility(facilityStreamId)
    return facility
  }

  @Get(':facilityId/events')
  @ApiOkResponse({ type: UntypedEventClass })
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

  @Get(':facilityId/transactions')
  @ApiOkResponse({ type: TransactionEntity })
  async getDrawingTransactions(
    @Param('facilityId') facilityId: string,
    @Query('resolution')
    resolution: TransactionResolution = 'daily',
  ): Promise<Transaction[] | SummarisedTransaction[]> {
    const facilityEvents =
      resolution === 'daily'
        ? await this.transactionService.getDailyTransactions(facilityId)
        : await this.transactionService.getMonthlyTransactions(facilityId)
    if (facilityEvents === null) {
      throw new NotFoundException()
    }
    return facilityEvents
  }

  @Get()
  @ApiQuery({ name: 'isActive', required: false })
  async getAllFacility(
    @Query('isActive') isActive: boolean,
  ): Promise<FacilityResponseDtoClass[] | null> {
    const allEvents = await this.facilityService.getAllFacilities(isActive)
    if (allEvents === null) {
      throw new NotFoundException()
    }
    return plainToInstance(FacilityResponseDtoClass, allEvents, {
      enableCircularCheck: true,
    })
  }

  @Post('new')
  @ApiCreatedResponse({ type: FacilityResponseDtoClass })
  async newFacility(
    @Body() body: NewFacilityRequestDtoClass,
  ): Promise<FacilityResponseDtoClass> {
    const newFacility = await this.facilityService.createNewFacility(body)
    return plainToInstance(FacilityResponseDtoClass, newFacility, {
      enableCircularCheck: true,
    })
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
    return plainToInstance(FacilityResponseDtoClass, updatedFacility, {
      enableCircularCheck: true,
    })
  }

  @Post(':facilityId/addFacilityFee/fixed')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  @ApiQuery({ name: 'overrideFacilityType', required: false })
  async addFixedFacilityFee(
    @Param('facilityId') facilityId: string,
    @Query('version') version: string,
    @Body() feeConfig: AddFixedFacilityFeeDtoClass,
    @Query('overrideFacilityType') overrideFacilityType?: boolean,
  ): Promise<FacilityResponseDtoClass> {
    if (!overrideFacilityType) {
      const facility = await this.facilityService.getFacility(facilityId)
      const isPermitted =
        await this.facilityTypeService.verifyConfigMatchesType(
          { facilityFeeStrategies: 'FixedFacilityFee' },
          facility.facilityType,
        )
      if (!isPermitted) {
        throw new BadRequestException(
          `Fixed fees are not permitted on facilities of type "${facility.facilityType}"`,
        )
      }
    }
    const updatedFacility = await this.facilityService.addFacilityFee(
      facilityId,
      Number(version),
      feeConfig,
    )
    return plainToInstance(FacilityResponseDtoClass, updatedFacility, {
      enableCircularCheck: true,
    })
  }

  @Post(':facilityId/addFacilityFee/accruing')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async addAccruingFacilityFee(
    @Param('facilityId') facilityId: string,
    @Query('version') version: string,
    @Body() feeConfig: AddAccruingFacilityFeeDtoClass,
  ): Promise<FacilityResponseDtoClass> {
    const updatedFacility = await this.facilityService.addFacilityFee(
      facilityId,
      Number(version),
      feeConfig,
    )
    return plainToInstance(FacilityResponseDtoClass, updatedFacility, {
      enableCircularCheck: true,
    })
  }
}

export default FacilityController
