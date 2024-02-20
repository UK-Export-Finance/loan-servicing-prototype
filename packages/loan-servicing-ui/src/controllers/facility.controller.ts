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
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import FacilityService from 'services/facility.service'
import { FacilityPrincipalAdjustmentFormDto, NewFacilityRequestFormDto } from 'types/dtos/facility.dto'
import { getDateFromDateInput } from 'utils/form-helpers'

@Controller('')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get('facility/new')
  @Render('create-facility')
  renderCreateFacilityPage(): void {}

  @Get()
  @Render('facility-list')
  async renderAllFacilities(): Promise<{
    allFacilities: FacilityDto[] | null
  }> {
    const allFacilities = await tryGetApiData<FacilityDto[]>('facility/all')
    return { allFacilities }
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
      issuedEffectiveDate: getDateFromDateInput(requestDto, 'issuedEffectiveDate'),
    }
    const newFacility = await this.facilityService.createFacility(request)
    response.redirect(`/facility/${newFacility?.streamId}?facilityCreated=true`)
  }

  @Post('facility/:id/:version/adjustprincipal')
  async addPrincipalAdjustment(
    @Param('id') id: string,
    @Param('version') version: string,
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
}

export default FacilityController
