import { Injectable } from '@nestjs/common'
import {
  DrawingAccrualStrategyOption,
  CalculateDrawingAccrualEvent,
  FixedDrawingAccrualStrategyOption,
} from 'loan-servicing-common'
import { InProgressDrawing } from 'modules/projections/builders/DrawingBuilder'
import {
  AccrualWithEvents,
  getFixedDrawingAccrualEvents,
} from './generate-events.strategies'
import calculateDrawingAccrualStrategies, {
  CalculateDrawingAccrualStrategy,
} from './calculateFee.strategies'

@Injectable()
class DrawingAccrualService {
  calculateAccrual<T extends CalculateDrawingAccrualEvent>(
    drawing: InProgressDrawing,
    event: T,
  ): string {
    const handler = calculateDrawingAccrualStrategies[
      event.type
    ] as CalculateDrawingAccrualStrategy<T>
    return handler(drawing, event)
  }

  generateEventsForAccrual = <T extends DrawingAccrualStrategyOption>(
    drawing: InProgressDrawing,
    option: T,
  ): AccrualWithEvents[] =>
    // const generateEvents = drawingAccrualEventStrategies[
    //   option.name
    // ] as GetDrawingAccrualEventsStrategy<T>
    getFixedDrawingAccrualEvents(
      drawing,
      option as FixedDrawingAccrualStrategyOption,
    )
}

export default DrawingAccrualService
