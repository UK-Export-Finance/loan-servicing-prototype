import { Controller, Get, Param, Put } from '@nestjs/common'
import { ApiDefaultResponse, ApiFoundResponse, ApiTags } from '@nestjs/swagger'
import SystemValueService from './systemValue.service'

@ApiTags('System Values')
@Controller('/system')
class SystemValueController {
  constructor(private systemValueService: SystemValueService) {}

  @Get('date')
  @ApiFoundResponse({ type: Date })
  async getSystemDate(): Promise<Date> {
    const result = await this.systemValueService.getSystemDate()

    return result
  }

  @Put('date/:dateString')
  @ApiDefaultResponse({ type: Date })
  async setSystemDate(@Param('dateString') dateStr: string): Promise<Date> {
    const date = new Date(dateStr)
    await this.systemValueService.setSystemDate(date)
    return date
  }
}

export default SystemValueController
