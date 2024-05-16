import { Module } from '@nestjs/common'
import SystemValueEntity from 'models/SystemValueEntity'
import { TypeOrmModule } from '@nestjs/typeorm'
import ServerController from './server.controller'
import SystemValueService from './systemValue.service'

@Module({
  controllers: [ServerController],
  providers: [SystemValueService],
  imports: [TypeOrmModule.forFeature([SystemValueEntity])],
})
class ServerModule {}

export default ServerModule
