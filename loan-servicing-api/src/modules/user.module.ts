import { Module } from '@nestjs/common'
import { UserController } from '../controllers/user.controller'
import { UserService } from '../services/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import User from '../entity/User'

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
