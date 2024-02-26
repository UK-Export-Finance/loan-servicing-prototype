import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiCreatedResponse, ApiFoundResponse, ApiTags } from '@nestjs/swagger'
import FacilityTypeDtoClass from 'models/dtos/facilityType'
import FacilityTypeService from './facilityType.service'

@ApiTags('FacilityType')
@Controller('/facilitytype')
class FacilityTypeController {
  constructor(private facilityTypeService: FacilityTypeService) {}

  @Get(':name')
  @ApiFoundResponse({ type: FacilityTypeDtoClass })
  async getFacilityType(
    @Param('name') name: string,
  ): Promise<FacilityTypeDtoClass> {
    return this.facilityTypeService.getPropertiesOfFacilityType(name)
  }

  @Post()
  @ApiCreatedResponse({ type: FacilityTypeDtoClass })
  async createFacilityType(
    @Body() body: FacilityTypeDtoClass,
  ): Promise<FacilityTypeDtoClass> {
    return this.facilityTypeService.createFacilityType(body)
  }
}

export default FacilityTypeController
