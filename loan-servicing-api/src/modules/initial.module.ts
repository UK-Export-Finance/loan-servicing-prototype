import { Module } from '@nestjs/common'
import { InitialController } from '../controllers/initial.controller'
import { InitialService } from '../services/initial.service'
import { DatabaseModule } from './database.module'

@Module({ controllers: [InitialController], providers: [InitialService], imports: [DatabaseModule] })
export class InitialModule {}
