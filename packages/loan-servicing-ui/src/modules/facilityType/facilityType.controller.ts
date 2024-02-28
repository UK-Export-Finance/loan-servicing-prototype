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
import {
  CreateFacilityTypeFormOutput,
  CreateFacilityTypeNjkInput,
} from 'templates/edit-facility-type'
import { calculateInterestSelectOptions } from 'controls/strategyControlsOptions'
import FacilityTypeService from './facilityType.service'

@Controller('facility-type')
class FacilityTypeController {
  constructor(private facilityTypeService: FacilityTypeService) {}

  @Get('new')
  @Render('edit-facility-type')
  renderCreateFacilityTypePage(): CreateFacilityTypeNjkInput {
    return {
      calculateInterestSelectOptions,
    }
  }

  @Get(':name')
  @Render('facility-type')
  async renderFacilityTypePage(
    @Param('name') name: string,
    @Query('created') created?: boolean,
  ): Promise<{
    facilityType: FacilityType
    created: boolean | undefined
  }> {
    const facilityType = await this.facilityTypeService.getFacilityType(name)
    if (!facilityType) {
      throw new NotFoundException()
    }
    return {
      facilityType,
      created,
    }
  }

  @Post()
  async createFacilityType(
    @Body() requestDto: CreateFacilityTypeFormOutput,
    @Res() response: Response,
  ): Promise<void> {
    const newFacilityType = await this.facilityTypeService.createFacilityType({
      ...requestDto,
      repaymentsStrategies: ['regular'],
    })
    response.redirect(`/facility-type/${newFacilityType?.name}?created=true`)
  }
}

export default FacilityTypeController
