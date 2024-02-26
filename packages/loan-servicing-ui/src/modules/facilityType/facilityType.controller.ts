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
import { FacilityType } from 'loan-servicing-common'
import FacilityTypeService from './facilityType.service'

@Controller('facility-type')
class FacilityTypeController {
  constructor(private facilityTypeService: FacilityTypeService) {}

  @Get('new')
  @Render('edit-facility-type')
  renderCreateFacilityPage(): void {}

  @Get(':name')
  @Render('facility-type')
  async renderFacilityPage(
    @Param('name') name: string,
    @Query('created') created?: boolean,
  ): Promise<{
    facilityType: FacilityType
    created: boolean | undefined
  }> {
    const facilityType = await this.facilityTypeService.getFacility(name)
    if (!facilityType) {
      throw new NotFoundException()
    }
    return {
      facilityType,
      created,
    }
  }

  @Post()
  async createFacility(
    @Body() requestDto: FacilityType,
    @Res() response: Response,
  ): Promise<void> {
    const newFacilityType =
      await this.facilityTypeService.createFacility(requestDto)
    response.redirect(`/facility-type/${newFacilityType?.name}?created=true`)
  }
}

export default FacilityTypeController
