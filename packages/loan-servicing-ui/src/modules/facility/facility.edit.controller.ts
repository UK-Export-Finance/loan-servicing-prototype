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
import { buildSelectOptionsFromStrings } from 'controls/strategyControlsOptions'
import { Response } from 'express'
import {
  AccruingFacilityFeeStrategyOption,
  AddAccruingFacilityFeeDto,
  AddFixedFacilityFeeDto,
  AdjustFacilityAmountDto,
} from 'loan-servicing-common'
import mapEventsToTable from 'mappers/nunjuck-mappers/eventTable'
import FacilityService from 'modules/facility/facility.service'
import FacilityTypeService from 'modules/facilityType/facilityType.service'
import { accruingFacilityFeeTypes } from 'strings/strategyNames'
import {
  AddAccruingFacilityFeeFormDto,
  AddFacilityFeeNjkInput,
  AddFixedFacilityFeeFormDto,
} from 'templates/facility-edit/add-fee'
import {
  AmendPrincipalNjkInput,
  FacilityPrincipalAdjustmentFormDto,
} from 'templates/facility-edit/amend-principal'
import { getDateFromDateInput } from 'utils/form-helpers'

@Controller('facility')
class EditFacilityController {
  constructor(
    private facilityService: FacilityService,
    private facilityTypeService: FacilityTypeService,
  ) {}

  @Get(':id/adjustPrincipal')
  @Render('facility-edit/amend-principal')
  async renderPrincipalAdjustmentPage(
    @Param('id') id: string,
  ): Promise<AmendPrincipalNjkInput> {
    const facility = await this.facilityService.getFacility(id)
    if (!facility) {
      throw new NotFoundException()
    }
    const events = await this.facilityService.getFacilityEventTableRows(id)

    return {
      facility,
      eventRows: mapEventsToTable(events!),
    }
  }

  @Post(':id/adjustprincipal')
  async addPrincipalAdjustment(
    @Param('id') id: string,
    @Query('version') version: string,
    @Body()
    requestDto: FacilityPrincipalAdjustmentFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const adjustmentDto: AdjustFacilityAmountDto = {
      effectiveDate: getDateFromDateInput(
        requestDto,
        'effectiveDate',
      ).toISOString(),
      adjustment: requestDto.adjustment,
    }
    await this.facilityService.adjustPrincipal(id, version, adjustmentDto)
    response.redirect(`/facility/${id}`)
  }

  @Get(':id/fee/new')
  @Render('facility-edit/add-fee')
  async renderAddFacilityFeePage(
    @Param('id') id: string,
  ): Promise<AddFacilityFeeNjkInput> {
    const facility = await this.facilityService.getFacility(id)
    if (!facility) {
      throw new NotFoundException()
    }

    const facilityType = await this.facilityTypeService.getFacilityType(
      facility?.facilityType,
    )
    if (!facilityType) {
      throw new NotFoundException()
    }

    return {
      facility,
      facilityType,
      accruesOnOptions: buildSelectOptionsFromStrings<
        AccruingFacilityFeeStrategyOption['accruesOn']
      >(accruingFacilityFeeTypes),
    }
  }

  @Post(':id/fixedFacilityFee')
  async addFixedFacilityFee(
    @Param('id') id: string,
    @Query('version') version: string,
    @Body()
    requestDto: AddFixedFacilityFeeFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const adjustmentDto: AddFixedFacilityFeeDto = {
      name: 'FixedFacilityFee',
      effectiveDate: getDateFromDateInput(requestDto, 'effectiveDate'),
      feeAmount: requestDto.feeAmount,
    }
    await this.facilityService.addFixedFacilityFee(id, version, adjustmentDto)
    response.redirect(`/facility/${id}`)
  }

  @Post(':id/accruingFacilityFee')
  async addAccruingFacilityFee(
    @Param('id') id: string,
    @Query('version') version: string,
    @Body()
    requestDto: AddAccruingFacilityFeeFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const adjustmentDto: AddAccruingFacilityFeeDto = {
      name: 'AccruingFacilityFee',
      effectiveDate: getDateFromDateInput(requestDto, 'effectiveDate'),
      expiryDate: getDateFromDateInput(requestDto, 'expiryDate'),
      accrualRate: requestDto.accrualRate,
      accruesOn: requestDto.accruesOn,
    }
    await this.facilityService.addAccruingFacilityFee(
      id,
      version,
      adjustmentDto,
    )
    response.redirect(`/facility/${id}`)
  }
}

export default EditFacilityController
