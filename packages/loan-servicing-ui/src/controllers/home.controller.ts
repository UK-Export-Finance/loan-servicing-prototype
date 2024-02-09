import { Controller, Get, Render } from '@nestjs/common'
import { UserService } from '../services/user.service'

@Controller('')
export class HomeController {
  constructor(private userService: UserService) {}

  @Get()
  @Render('home')
  async findAll() {
    const apiData = await this.userService.getUser()
    return {
      apiData,
    }
  }
}
