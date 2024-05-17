import { Module } from '@nestjs/common'
import SystemValueEntity from 'models/SystemValueEntity'
import { TypeOrmModule } from '@nestjs/typeorm'
import SystemController from './system.controller'
import SystemValueService from './systemValue.service'

@Module({
  controllers: [SystemController],
  providers: [SystemValueService],
  imports: [TypeOrmModule.forFeature([SystemValueEntity])],
})
class SystemModule {}

export default SystemModule
