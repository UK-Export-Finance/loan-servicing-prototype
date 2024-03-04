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
import {
  calculateInterestSelectOptions,
  filterSelectOptions,
  repaymentsSelectOptions,
} from 'controls/strategyControlsOptions'
import { Response } from 'express'
import mapCreateFacilityFormToRequest from 'mappers/form-mappers/createFacilityMapper'
import {
  AdjustFacilityPrincipalDto,
  CalculateInterestStrategyName,
  FacilityDto,
  FacilityType,
  NewFacilityRequestDto,
  RepaymentStrategyName,
  UpdateInterestRequestDto,
} from 'loan-servicing-common'
import FacilityService from 'modules/facility/facility.service'
import {
  CreateFacilityNjkInput,
  NewFacilityRequestFormDto,
} from 'templates/create-facility'
import { FacilityNjkInput } from 'templates/facility'
import { AmendPrincipalNjkInput } from 'templates/facility-edit/amend-principal'
import { FacilityListNjkInput } from 'templates/facility-list'
import { ConfigureFacilityStrategiesNjkInput } from 'templates/new-facility-strategies'
import {
  FacilityInterestRateUpdateFormDto,
  FacilityPrincipalAdjustmentFormDto,
} from 'types/dtos/facility.dto'
import { getDateFromDateInput } from 'utils/form-helpers'
import { facilityToFacilitySummaryProps } from 'mappers/nunjuck-mappers/facilitySummary'

@Controller('')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

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

  @Get('facility/new/start')
  @Render('new-facility-strategies')
  async renderFacilityStrategySelectionPage(
    @Query('facilityType') facilityTypeName: string,
  ): Promise<ConfigureFacilityStrategiesNjkInput> {
    const facilityType = await tryGetApiData<FacilityType>(
      `facility-type/${facilityTypeName}`,
    )
    if (!facilityType) {
      throw new Error('No facility type found')
    }
    return {
      calculateInterestStrategyNames: filterSelectOptions(
        calculateInterestSelectOptions,
        facilityType.interestStrategies,
      ),
      repaymentStrategyNames: filterSelectOptions(
        repaymentsSelectOptions,
        facilityType.repaymentsStrategies,
      ),
      facilityType: facilityTypeName,
    }
  }

  @Get()
  @Render('facility-list')
  async renderAllFacilities(): Promise<FacilityListNjkInput> {
    const allFacilities = await tryGetApiData<FacilityDto[]>('facility')
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
    const transactionRows =
      await this.facilityService.getFacilityTransactionRows(id)

    return {
      facility,
      eventRows: events!,
      facilityCreated,
      transactionRows: transactionRows!,
      facilitySummaryListProps: facilityToFacilitySummaryProps(facility)
    }
  }

  @Post('facility')
  async createFacility(
    @Body() requestDto: NewFacilityRequestFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const request: NewFacilityRequestDto =
      mapCreateFacilityFormToRequest(requestDto)
    const newFacility = await this.facilityService.createFacility(request)
    response.redirect(`/facility/${newFacility?.streamId}?facilityCreated=true`)
  }

  @Get('facility/:id/adjustPrincipal')
  @Render('facility-edit/amend-principal')
  async renderPrincipalAdjustmentPage(
    @Param('id') id: string,
  ): Promise<AmendPrincipalNjkInput> {
    const facility = await this.facilityService.getFacility(id)
    if (!facility) {
      throw new NotFoundException()
    }
    const events = await this.facilityService.getFacilityEventTableRows(id)
    const transactionRows =
      await this.facilityService.getFacilityTransactionRows(id)

    return {
      facility,
      eventRows: events!,
      transactionRows: transactionRows!,
    }
  }

  @Post('facility/:id/adjustprincipal')
  async addPrincipalAdjustment(
    @Param('id') id: string,
    @Query('version') version: string,
    @Body()
    requestDto: FacilityPrincipalAdjustmentFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const adjustmentDto: AdjustFacilityPrincipalDto = {
      effectiveDate: getDateFromDateInput(
        requestDto,
        'effectiveDate',
      ).toISOString(),
      adjustment: requestDto.adjustment,
    }
    await this.facilityService.adjustPrincipal(id, version, adjustmentDto)
    response.redirect(`/facility/${id}`)
  }

  @Get('facility/:id/changeInterest')
  @Render('facility-edit/change-interest')
  async renderInterestChangePage(
    @Param('id') id: string,
  ): Promise<AmendPrincipalNjkInput> {
    const facility = await this.facilityService.getFacility(id)
    if (!facility) {
      throw new NotFoundException()
    }
    const events = await this.facilityService.getFacilityEventTableRows(id)
    const transactionRows =
      await this.facilityService.getFacilityTransactionRows(id)

    return {
      facility,
      eventRows: events!,
      transactionRows: transactionRows!,
    }
  }

  @Post('facility/:id/changeInterest')
  async updateInterest(
    @Param('id') id: string,
    @Query('version') version: string,
    @Body()
    requestDto: FacilityInterestRateUpdateFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const updateDto: UpdateInterestRequestDto = {
      effectiveDate: getDateFromDateInput(
        requestDto,
        'effectiveDate',
      ).toISOString(),
      interestRate: requestDto.interestRate,
    }
    await this.facilityService.updateInterest(id, version, updateDto)
    response.redirect(`/facility/${id}`)
  }
}

export default FacilityController
