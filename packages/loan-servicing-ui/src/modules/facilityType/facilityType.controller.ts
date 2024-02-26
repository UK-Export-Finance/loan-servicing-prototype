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
import { FacilityDto, NewFacilityRequestDto } from 'loan-servicing-common'
import FacilityService from 'modules/facility/facility.service'
import { NewFacilityRequestFormDto } from 'types/dtos/facility.dto'
import { getDateFromDateInput } from 'utils/form-helpers'

@Controller('facility-type')
class FacilityTypeController {
  constructor(private facilityService: FacilityService) {}

  @Get('new')
  @Render('create-facility')
  renderCreateFacilityPage(): void {}

  @Get()
  @Render('list')
  async renderAllFacilities(): Promise<{
    allFacilities: FacilityDto[] | null
  }> {
    const allFacilities = await tryGetApiData<FacilityDto[]>('facility')
    return { allFacilities }
  }

  @Get(':id')
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
}

export default FacilityTypeController
