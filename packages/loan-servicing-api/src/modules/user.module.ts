import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import UserController from 'controllers/user.controller'
import UserService from 'services/user.service'
import User from 'models/entities/User'

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
})
class UserModule {}

export default UserModule
