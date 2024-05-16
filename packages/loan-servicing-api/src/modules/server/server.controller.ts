import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOkResponse } from '@nestjs/swagger'

@ApiTags('Server')
@Controller('/server')
class ServerController {
  @Get('health')
  @ApiOkResponse()
  getFacility(): string {
    return 'LS Healthy'
  }
}

export default ServerController
