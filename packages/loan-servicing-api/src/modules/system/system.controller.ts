import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOkResponse } from '@nestjs/swagger'
import SystemValueService from './systemValue.service'

@ApiTags('System')
@Controller('system')
class SystemController {
  constructor(private systemValueService: SystemValueService) {}

  @Get('health')
  @ApiOkResponse()
  getHealth(): string {
    return 'LS Healthy'
  }

  @Get('date')
  @ApiOkResponse()
  async getSystemDate(): Promise<string> {
    const systemDate = await this.systemValueService.getSystemDate()
    return systemDate.toISOString()
  }
}

export default SystemController
