import {
  CalculateDrawingAccrualEvent,
  Drawing,
  DrawingAccrualStrategyName,
  DrawingAccrualStrategyOption,
  FixedLoanInterestAccrualStrategyOption,
  MarketLoanInterestAccrualStrategyOption,
} from 'loan-servicing-common'

export type GetDrawingAccrualEventsStrategy<T extends DrawingAccrualStrategyOption> =
  (facility: Drawing, option: T) => CalculateDrawingAccrualEvent[]

export const getFixedDrawingAccrualEvents: GetDrawingAccrualEventsStrategy<
  FixedLoanInterestAccrualStrategyOption
> = (facility, option) => {
  const expiryDate = new Date(option.expiryDate)
  let dateToProcess = new Date(option.effectiveDate)

  const drawingAccrualEvents: CalculateDrawingAccrualEvent[] = []
  while (dateToProcess <= expiryDate) {
    drawingAccrualEvents.push({
      effectiveDate: dateToProcess,
      streamId: facility.streamId,
      entityType: 'drawing',
      type: 'CalculateFixedDrawingAccrual',
      eventData: option,
    })
    // Naive date management - not suitable for production
    dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
  }
  return drawingAccrualEvents
}

export const getMarketDrawingAccrualEvents: GetDrawingAccrualEventsStrategy<
  MarketLoanInterestAccrualStrategyOption
> = (facility, option) => {
  const expiryDate = new Date(option.expiryDate)
  let dateToProcess = new Date(option.effectiveDate)

  const drawingAccrualEvents: CalculateDrawingAccrualEvent[] = []
  while (dateToProcess <= expiryDate) {
    drawingAccrualEvents.push({
      effectiveDate: dateToProcess,
      streamId: facility.streamId,
      entityType: 'drawing',
      type: 'CalculateMarketDrawingAccrual',
      eventData: option,
    })
    // Naive date management - not suitable for production
    dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
  }
  return drawingAccrualEvents
}

type DrawingAccrualEventStrategies = {
  [K in DrawingAccrualStrategyName]: GetDrawingAccrualEventsStrategy<
    Extract<DrawingAccrualStrategyOption, { name: K }>
  >
}

export const drawingAccrualEventStrategies: DrawingAccrualEventStrategies = {
  FixedLoanInterestAccrual: getFixedDrawingAccrualEvents,
  MarketLoanInterestAccrual: getMarketDrawingAccrualEvents,
}
