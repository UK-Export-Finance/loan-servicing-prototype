import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";

@ApiTags('Facility')
@Controller('/')
class ServerController {
  @Get('health')
  @ApiOkResponse()
  getFacility(
  ): void {}
}

export default ServerController