import { Injectable } from '@nestjs/common'
import {
  DrawingAccrualStrategyOption,
  CalculateDrawingAccrualEvent,
  Drawing,
} from 'loan-servicing-common'
import {
  GetDrawingAccrualEventsStrategy,
  drawingAccrualEventStrategies,
} from './generate-events.strategies'
import calculateDrawingAccrualStrategies, {
  CalculateDrawingAccrualStrategy,
} from './calculateFee.strategies'

@Injectable()
class DrawingAccrualService {
  calculateAccrual<T extends CalculateDrawingAccrualEvent>(
    drawing: Drawing,
    event: T,
  ): string {
    const handler = calculateDrawingAccrualStrategies[
      event.type
    ] as CalculateDrawingAccrualStrategy<T>
    return handler(drawing, event)
  }

  generateEventsForAccrual = <T extends DrawingAccrualStrategyOption>(
    drawing: Drawing,
    option: T,
  ): CalculateDrawingAccrualEvent[] => {
    const generateEvents = drawingAccrualEventStrategies[
      option.name
    ] as GetDrawingAccrualEventsStrategy<T>
    return generateEvents(drawing, option)
  }
}

export default DrawingAccrualService
