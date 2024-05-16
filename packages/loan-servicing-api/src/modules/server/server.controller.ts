import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOkResponse } from '@nestjs/swagger'
import SystemValueService from './systemValue.service'

@ApiTags('Server')
@Controller('/server')
class ServerController {
  constructor(private systemValueService: SystemValueService){}

  @Get('health')
  @ApiOkResponse()
  getHealth(): string {
    return 'LS Healthy'
  }

  @Get('date')
  @ApiOkResponse()
  async getSystemDate(): Promise<Date> {
    return this.systemValueService.getSystemDate()
  }
}

export default ServerController
