import {
  Body,
  Controller,
  Get,
  Param,
  Put,
} from '@nestjs/common'
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
    const result = this.facilityTypeService.getPropertiesOfFacilityType(name)
    
    return result
  }

  @Get()
  @ApiFoundResponse({ type: FacilityTypeDtoClass })
  async getAllFacilityTypes(): Promise<FacilityTypeDtoClass[]> {
    const result = await this.facilityTypeService.getAllFacilityTypes()
    return result
  }

  @Put()
  @ApiCreatedResponse({ type: FacilityTypeDtoClass })
  async createFacilityType(
    @Body() body: FacilityTypeDtoClass,
  ): Promise<FacilityTypeDtoClass> {
    return this.facilityTypeService.saveFacilityType(body)
  }
}

export default FacilityTypeController
