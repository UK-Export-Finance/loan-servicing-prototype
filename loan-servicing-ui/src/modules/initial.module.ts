import { Module } from '@nestjs/common'
import { InitialController } from '../controllers/initial.controller'
import { InitialService } from '../services/initial.service'

@Module({ controllers: [InitialController], providers: [InitialService] })
export class InitialModule {}
