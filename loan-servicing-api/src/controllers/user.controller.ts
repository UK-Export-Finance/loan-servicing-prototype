import { Controller, Get } from '@nestjs/common'
import { UserService as UserService } from '../services/user.service'
import { UserResponseDto } from 'loan-servicing-common'

@Controller('')
export class UserController {
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
