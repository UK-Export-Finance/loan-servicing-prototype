import { Module } from '@nestjs/common'
import { InitialController } from '../controllers/initial.controller'
import { InitialService } from '../services/initial.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import User from '../entity/User'

@Module({
  controllers: [InitialController],
  providers: [InitialService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class InitialModule {}
