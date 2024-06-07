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
import mapCreateFacilityFormToRequest from 'mappers/form-mappers/createFacilityMapper'
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
import { FacilityListNjkInput } from 'templates/facility-list'
import {
  facilityToDrawingSummaries,
  facilityToFacilitySummaryProps,
} from 'mappers/nunjuck-mappers/facilitySummary'
import mapEventsToTable from 'mappers/nunjuck-mappers/eventTable'
import mapTransactionsToTable from 'mappers/nunjuck-mappers/transactionTable'

@Controller('')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

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

  @Get('facility/:id')
  async renderFacilityPage(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('facilityCreated') facilityCreated?: boolean,
  ): Promise<void> {
    const facility = await this.facilityService.getFacility(id)
    if (!facility) {
      throw new NotFoundException()
    }
    const events = await this.facilityService.getFacilityEventTableRows(id)
    const transactions =
      await this.facilityService.getFacilityTransactionRows(id)

    return res.render(
      facility.hierarchyType === 'root' ? 'facility' : 'participation',
      {
        facility,
        eventRows: mapEventsToTable(events!),
        transactionRows: mapTransactionsToTable(transactions!),
        facilityCreated,
        facilitySummaryListProps: facilityToFacilitySummaryProps(facility),
        drawingSummaries: facilityToDrawingSummaries(facility),
        currentDate: new Date(facility.currentDate).toISOString().split('T')[0],
      },
    )
  }
}

export default FacilityController
