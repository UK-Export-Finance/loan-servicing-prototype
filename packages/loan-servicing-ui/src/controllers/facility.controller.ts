import {
  Controller,
  Get,
  Param,
  Post,
  Render,
} from '@nestjs/common'
import { Facility } from 'loan-servicing-common'
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
  ): Promise<{ facility: Facility | null }> {
    const facility = await this.facilityService.getFacility(id)
    return { facility }
  }

  @Post('facility')
  @Render('facility-created')
  async createFacility(): Promise<{ facility: Facility | null }> {
    const newFacility = await this.facilityService.createFacility({
      obligor: 'asdf',
      facilityAmount: 5,
    })
    return { facility: newFacility }
  }
}

export default FacilityController
