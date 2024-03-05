import { Module } from '@nestjs/common'
import EditDrawingController from './drawing.edit.controller'
import DrawingService from './drawing.service'
import DrawingController from './drawing.controller'

@Module({
  controllers: [DrawingController, EditDrawingController],
  providers: [DrawingService],
  exports: [DrawingService],
})
class DrawingModule {}

export default DrawingModule
