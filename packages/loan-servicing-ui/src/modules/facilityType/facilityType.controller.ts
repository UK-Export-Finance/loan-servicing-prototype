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
import {
  CreateFacilityTypeFormOutput,
  CreateFacilityTypeNjkInput,
} from 'templates/edit-facility-type'
import {
  buildSelectOptionsFromStrings,
  facilityFeeSelectOptions,
  repaymentsSelectOptions,
} from 'controls/strategyControlsOptions'
import { FacilityTypeNjkInput } from 'templates/facility-type'
import { drawingAccrualStrategyNames } from 'strings/strategyNames'
import FacilityTypeService from './facilityType.service'

@Controller('facility-type')
class FacilityTypeController {
  constructor(private facilityTypeService: FacilityTypeService) {}

  @Get('new')
  @Render('edit-facility-type')
  renderCreateFacilityTypePage(): CreateFacilityTypeNjkInput {
    return {
      drawingAccrualSelectOptions: buildSelectOptionsFromStrings(drawingAccrualStrategyNames),
      repaymentsSelectOptions,
      facilityFeeSelectOptions,
    }
  }

  @Get(':name')
  @Render('facility-type')
  async renderFacilityTypePage(
    @Param('name') name: string,
    @Query('created') created?: boolean,
  ): Promise<FacilityTypeNjkInput> {
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
    const newFacilityType =
      await this.facilityTypeService.createFacilityType(requestDto)
    response.redirect(`/facility-type/${newFacilityType?.name}?created=true`)
  }
}

export default FacilityTypeController
