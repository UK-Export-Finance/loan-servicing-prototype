import {
  CalculateDrawingAccrualEvent,
  CalculateFixedDrawingAccrualEvent,
  CalculateMarketDrawingAccrualEvent,
  Drawing,
} from 'loan-servicing-common'
import { calculateAccrual } from 'maths/accrualCalculations'

export type CalculateDrawingAccrualStrategy<T extends CalculateDrawingAccrualEvent> =
  (facility: Drawing, event: T) => string

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

const calculateDrawingAccrualStrategies: CaclulateDrawingAccrualEventHandlers = {
  CalculateMarketDrawingAccrual: calculateMarketDrawingAccrual,
  CalculateFixedDrawingAccrual: calculateFixedDrawingAccrual,
}

export default calculateDrawingAccrualStrategies
