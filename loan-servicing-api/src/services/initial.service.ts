import { Injectable } from '@nestjs/common'
import User from '../entity/User'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class InitialService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async getUser() {
    const user = new User()
    user.name = 'user-name'
    const result = await this.userRepo.save(user)
    return result
  }
}
