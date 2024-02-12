import { Controller, Get } from '@nestjs/common'
import { UserResponseDto } from 'loan-servicing-common'
import UserService from 'services/user.service'

@Controller('')
class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser(): Promise<UserResponseDto> {
    const { name, id } = await this.userService.getUser()
    return {
      name,
      id: id.toString(),
    }
  }
}

export default UserController
