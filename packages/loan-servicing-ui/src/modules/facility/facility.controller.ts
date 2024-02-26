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
import {
  AdjustFacilityPrincipalDto,
  FacilityDto,
  FacilityType,
  NewFacilityRequestDto,
  UpdateInterestRequestDto,
} from 'loan-servicing-common'
import FacilityService from 'modules/facility/facility.service'
import {
  FacilityInterestRateUpdateFormDto,
  FacilityPrincipalAdjustmentFormDto,
  NewFacilityRequestFormDto,
} from 'types/dtos/facility.dto'
import { getDateFromDateInput } from 'utils/form-helpers'

@Controller('')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get('facility/new')
  @Render('create-facility')
  async renderCreateFacilityPage(): Promise<{
    facilityTypes: { value: string; text: string }[]
  }> {
    const facilityTypes = await tryGetApiData<FacilityType[]>('facility-type')
    if (!facilityTypes || facilityTypes.length === 0) {
      throw new Error('No facility types found')
    }
    return {
      facilityTypes: facilityTypes?.map((t) => ({
        value: t.name,
        text: t.name,
      })),
    }
  }

  @Get()
  @Render('facility-list')
  async renderAllFacilities(): Promise<{
    allFacilities: FacilityDto[] | null
    allFacilityTypes: FacilityType[] | null
  }> {
    const allFacilities = await tryGetApiData<FacilityDto[]>('facility')
    const allFacilityTypes =
      await tryGetApiData<FacilityType[]>('facility-type')
    return { allFacilities, allFacilityTypes }
  }

  @Get('facility/:id')
  @Render('facility')
  async renderFacilityPage(
    @Param('id') id: string,
    @Query('facilityCreated') facilityCreated?: boolean,
  ): Promise<{
    facility: FacilityDto
    facilityCreated?: boolean
    eventRows: object
    transactionRows: object
  }> {
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
    }
  }

  @Post('facility')
  async createFacility(
    @Body() requestDto: NewFacilityRequestFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const request: NewFacilityRequestDto = {
      ...requestDto,
      expiryDate: getDateFromDateInput(requestDto, 'expiryDate'),
      issuedEffectiveDate: getDateFromDateInput(
        requestDto,
        'issuedEffectiveDate',
      ),
    }
    const newFacility = await this.facilityService.createFacility(request)
    response.redirect(`/facility/${newFacility?.streamId}?facilityCreated=true`)
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

  @Post('facility/:id/updateInterest')
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
