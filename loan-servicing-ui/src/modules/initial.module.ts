import { Module } from '@nestjs/common'
import { UserController } from '../controllers/initial.controller'
import { UserService } from '../services/initial.service'

@Module({ controllers: [UserController], providers: [UserService] })
export class UserModule {}
