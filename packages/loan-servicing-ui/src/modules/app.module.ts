import { Module } from '@nestjs/common'
import { HomeModule } from './home.module'

@Module({ imports: [HomeModule] })
export class AppModule {}
