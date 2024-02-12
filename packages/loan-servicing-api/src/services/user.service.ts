import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import User from 'entity/User'

@Injectable()
class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async getUser() {
    const user = new User()
    user.name = 'user-name'
    const result = await this.userRepo.save(user)
    return result
  }
}

export default UserService
