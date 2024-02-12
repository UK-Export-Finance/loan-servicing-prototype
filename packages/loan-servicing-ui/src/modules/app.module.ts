import { Module } from '@nestjs/common'
import HomeModule from './home.module'

@Module({ imports: [HomeModule] })
class AppModule {}

export default AppModule
