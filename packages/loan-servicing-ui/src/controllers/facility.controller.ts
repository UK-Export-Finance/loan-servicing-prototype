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
import { Facility, NewFacilityRequestDto } from 'loan-servicing-common'
import FacilityService from 'services/facility.service'

@Controller('')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get()
  @Render('create-facility')
  renderCreateFacilityPage(): void {}

  @Get('facility/all')
  @Render('facility-list')
  async renderAllFacilities(): Promise<{ allFacilities: Facility[] | null }> {
    const allFacilities = await tryGetApiData<Facility[]>('facility/all')
    return { allFacilities }
  }

  @Get('facility/:id')
  @Render('facility')
  async renderFacilityPage(
    @Param('id') id: string,
    @Query('facilityCreated') facilityCreated?: boolean,
  ): Promise<{
    facility: Facility
    facilityCreated?: boolean
    eventRows: object
  }> {
    const facility = await this.facilityService.getFacility(id)
    if (!facility) {
      throw new NotFoundException()
    }
    const events = await this.facilityService.getFacilityEventTableRows(id)

    return { facility, eventRows: events!, facilityCreated }
  }

  @Post('facility')
  async createFacility(
    @Body() requestDto: NewFacilityRequestDto,
    @Res() response: Response,
  ): Promise<void> {
    const newFacility = await this.facilityService.createFacility(requestDto)
    response.redirect(`/facility/${newFacility?.streamId}?facilityCreated=true`)
  }
}

export default FacilityController
