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
import { Response } from 'express'
import { AdjustFacilityAmountDto } from 'loan-servicing-common'
import FacilityService from 'modules/facility/facility.service'
import {
  AmendPrincipalNjkInput,
  FacilityPrincipalAdjustmentFormDto,
} from 'templates/facility-edit/amend-principal'
import { getDateFromDateInput } from 'utils/form-helpers'

@Controller('facility')
class EditFacilityController {
  constructor(private facilityService: FacilityService) {}

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
    const transactionRows =
      await this.facilityService.getFacilityTransactionRows(id)

    return {
      facility,
      eventRows: events!,
      transactionRows: transactionRows!,
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
}

export default EditFacilityController
