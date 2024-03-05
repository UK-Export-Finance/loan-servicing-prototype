import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common'
import { tryGetApiData } from 'api/base-client'
import { Response } from 'express'
import mapCreateFacilityFormToRequest, {
} from 'mappers/form-mappers/createFacilityMapper'
import {
  CalculateInterestStrategyName,
  DrawingDto,
  FacilityType,
  NewFacilityRequestDto,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import FacilityService from 'modules/facility/facility.service'
import {
  CreateFacilityNjkInput,
  NewFacilityRequestFormDto,
} from 'templates/create-facility'
import { FacilityNjkInput } from 'templates/facility'
import { FacilityListNjkInput } from 'templates/facility-list'
import {
  facilityToDrawingSummaries,
  facilityToFacilitySummaryProps,
} from 'mappers/nunjuck-mappers/facilitySummary'
import DrawingService from 'modules/drawing/drawing.service'

@Controller('')
class FacilityController {
  constructor(
    private facilityService: FacilityService,
    private drawingService: DrawingService,
  ) {}

  @Get('facility/new')
  @Render('create-facility')
  async renderCreateFacilityPage(
    @Query('facilityType') facilityTypeName: string,
    @Query('repaymentStrategy') repaymentStrategy: RepaymentStrategyName,
    @Query('calculateInterestStrategy')
    calculateInterestStrategy: CalculateInterestStrategyName,
  ): Promise<CreateFacilityNjkInput> {
    const facilityType = await tryGetApiData<FacilityType>(
      `facility-type/${facilityTypeName}`,
    )
    if (!facilityType) {
      throw new Error('No facility type found')
    }
    return {
      calculateInterestStrategy,
      repaymentStrategy,
      facilityType: facilityTypeName,
    }
  }

  @Get()
  @Render('facility-list')
  async renderAllFacilities(): Promise<FacilityListNjkInput> {
    const allFacilities = await tryGetApiData<DrawingDto[]>('facility')
    const allFacilityTypes =
      await tryGetApiData<FacilityType[]>('facility-type')
    return {
      allFacilities,
      allFacilityTypes,
      facilityTypeNames:
        allFacilityTypes?.map((t) => ({
          value: t.name,
          text: t.name,
        })) ?? [],
    }
  }

  @Get('facility/:id')
  @Render('facility')
  async renderFacilityPage(
    @Param('id') id: string,
    @Query('facilityCreated') facilityCreated?: boolean,
  ): Promise<FacilityNjkInput> {
    const facility = await this.facilityService.getFacility(id)
    if (!facility) {
      throw new NotFoundException()
    }
    const events = await this.facilityService.getFacilityEventTableRows(id)

    return {
      facility,
      eventRows: events!,
      facilityCreated,
      facilitySummaryListProps: facilityToFacilitySummaryProps(facility),
      drawingSummaries: facilityToDrawingSummaries(facility),
    }
  }

  @Post('facility')
  async createFacility(
    @Body() requestDto: NewFacilityRequestFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const newFacilityRequest: NewFacilityRequestDto =
      mapCreateFacilityFormToRequest(requestDto)
    const newFacility =
      await this.facilityService.createFacility(newFacilityRequest)
    if (!newFacility) {
      throw new Error('Failed to create facility')
    }
    response.redirect(`/facility/${newFacility?.streamId}?facilityCreated=true`)
  }
}

export default FacilityController
