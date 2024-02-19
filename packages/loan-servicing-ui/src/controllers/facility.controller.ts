import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import { Facility, NewFacilityRequestDto } from 'loan-servicing-common'
import FacilityService from 'services/user.service'

@Controller('')
class FacilityController {
  constructor(private facilityService: FacilityService) {}

  @Get()
  @Render('create-facility')
  renderCreateFacilityPage(): void {}

  @Get('facility/:id')
  @Render('facility')
  async renderFacilityPage(
    @Param('id') id: string,
    @Query('facilityCreated') facilityCreated?: boolean,
  ): Promise<{ facility: Facility | null; facilityCreated?: boolean }> {
    const facility = await this.facilityService.getFacility(id)
    return { facility, facilityCreated }
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
