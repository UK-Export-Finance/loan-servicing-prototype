import { Module } from '@nestjs/common'
import { HomeController } from '../controllers/home.controller'
import { UserService } from '../services/user.service'

@Module({ controllers: [HomeController], providers: [UserService] })
export class HomeModule {}
