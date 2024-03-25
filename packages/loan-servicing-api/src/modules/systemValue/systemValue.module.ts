import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import SystemValueEntity from 'models/entities/SystemValueEntity'
import SystemValueService from './systemValue.service'

@Module({
  imports: [TypeOrmModule.forFeature([SystemValueEntity])],
  providers: [SystemValueService],
  exports: [SystemValueService],
})
class SystemValueModule {}

export default SystemValueModule
