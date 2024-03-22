import {
  CalculateDrawingAccrualEvent,
  CalculateFixedDrawingAccrualEvent,
  CalculateMarketDrawingAccrualEvent,
} from 'loan-servicing-common'
import { calculateAccrual } from 'maths/accrualCalculations'
import { InProgressDrawing } from 'modules/projections/builders/DrawingBuilder'

export type CalculateDrawingAccrualStrategy<
  T extends CalculateDrawingAccrualEvent,
> = (facility:InProgressDrawing, event: T) => string

export const calculateFixedDrawingAccrual: CalculateDrawingAccrualStrategy<
  CalculateFixedDrawingAccrualEvent
> = (drawing, { eventData: { accrualRate } }) =>
  calculateAccrual(drawing.outstandingPrincipal, accrualRate)

export const calculateMarketDrawingAccrual: CalculateDrawingAccrualStrategy<
  CalculateMarketDrawingAccrualEvent
> = (drawing, { eventData: { accrualRate } }) =>
  calculateAccrual(drawing.outstandingPrincipal, accrualRate)

type CaclulateDrawingAccrualEventHandlers = {
  [K in CalculateDrawingAccrualEvent['type']]: CalculateDrawingAccrualStrategy<
    Extract<CalculateDrawingAccrualEvent, { type: K }>
  >
}

const calculateDrawingAccrualStrategies: CaclulateDrawingAccrualEventHandlers =
  {
    CalculateMarketDrawingAccrual: calculateMarketDrawingAccrual,
    CalculateFixedDrawingAccrual: calculateFixedDrawingAccrual,
  }

export default calculateDrawingAccrualStrategies
