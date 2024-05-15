import {
  Controller,
  Get,
  Render,
} from '@nestjs/common'

@Controller('')
class FacilityController {
  @Get()
  @Render('index')
  renderExamplePage(): void {}
}

export default FacilityController