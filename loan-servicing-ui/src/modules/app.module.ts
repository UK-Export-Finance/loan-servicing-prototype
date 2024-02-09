import { Module } from '@nestjs/common'
import { UserModule } from './initial.module'

@Module({ imports: [UserModule] })
export class AppModule {}
