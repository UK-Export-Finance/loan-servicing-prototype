import { Module } from '@nestjs/common'
import DevController from './dev.controller'

@Module({
  controllers: [DevController],
})
class DevModule {}

export default DevModule
