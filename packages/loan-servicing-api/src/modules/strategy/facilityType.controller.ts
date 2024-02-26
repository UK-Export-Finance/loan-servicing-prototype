import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiCreatedResponse, ApiFoundResponse, ApiTags } from '@nestjs/swagger'
import FacilityTypeDtoClass from 'models/dtos/facilityType'
import FacilityTypeService from './facilityType.service'

@ApiTags('FacilityType')
@Controller('/facility-type')
class FacilityTypeController {
  constructor(private facilityTypeService: FacilityTypeService) {}

  @Get(':name')
  @ApiFoundResponse({ type: FacilityTypeDtoClass })
  async getFacilityType(
    @Param('name') name: string,
  ): Promise<FacilityTypeDtoClass> {
    return this.facilityTypeService.getPropertiesOfFacilityType(name)
  }

  @Get()
  @ApiFoundResponse({ type: FacilityTypeDtoClass })
  async getAllFacilityTypes(
  ): Promise<FacilityTypeDtoClass[]> {
    const result = await this.facilityTypeService.getAllFacilityTypes()
    return result
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
