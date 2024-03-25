import { Controller, Get, Query, Req, Res } from '@nestjs/common'
import { putApiData } from 'api/base-client'
import { Response, Request } from 'express'

@Controller('dev')
class DevController {
  @Get('systemDate')
  async setSystemDate(
    @Query('newDate') dateStr: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    await putApiData(`system/date/${new Date(dateStr).toISOString()}`, {})
    const sourcePage = request.headers.referer
    response.redirect(sourcePage || '/')
  }
}

export default DevController
