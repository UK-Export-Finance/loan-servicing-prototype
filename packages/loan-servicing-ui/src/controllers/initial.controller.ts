import { Controller, Get, Render } from '@nestjs/common'
import { UserService } from '../services/initial.service'

@Controller('')
export class UserController {
  constructor(private initialService: UserService) {}

  @Get()
  @Render('initial')
  async findAll() {
    const apiData = await this.initialService.getUser()
    return {
      apiData,
    }
  }
}
