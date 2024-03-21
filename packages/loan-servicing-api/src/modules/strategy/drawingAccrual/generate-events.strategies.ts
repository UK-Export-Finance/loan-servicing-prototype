import {
  CalculateDrawingAccrualEvent,
  Drawing,
  DrawingAccrual,
  DrawingAccrualStrategyOption,
  FixedDrawingAccrualStrategyOption,
} from 'loan-servicing-common'

export type AccrualWithEvents = {
  accrual: DrawingAccrual
  events: CalculateDrawingAccrualEvent[]
}

export type GetDrawingAccrualEventsStrategy<
  T extends DrawingAccrualStrategyOption,
> = (facility: Drawing, option: T) => AccrualWithEvents[]

export const getFixedDrawingAccrualEvents: GetDrawingAccrualEventsStrategy<
  FixedDrawingAccrualStrategyOption
> = (facility, option) => {
  const expiryDate = new Date(option.expiryDate)
  let dateToProcess = new Date(option.effectiveDate)

  const allAccruals: AccrualWithEvents[] = []

  while (dateToProcess <= expiryDate) {
    const endOfPeriod = new Date(
      dateToProcess.getTime() +
        60000 * 60 * 24 * 7 * 4 * option.monthsBetweenPayment,
    )
    const nextPaymentDue = endOfPeriod < expiryDate ? endOfPeriod : expiryDate
    const currentPeriodEvents: CalculateDrawingAccrualEvent[] = []
    const id = `option.accrualId-${nextPaymentDue.toISOString().split('T')[0]}`
    const accrualWithEvents: AccrualWithEvents = {
      accrual: {
        id,
        currentValue: '0',
        finalValue: '0',
        config: {
          accrualId: id,
          accrualRate: option.accrualRate,
          effectiveDate: dateToProcess,
          expiryDate: nextPaymentDue,
          monthsBetweenPayment: option.monthsBetweenPayment,
          name: 'FixedDrawingAccrual',
        },
      },
      events: currentPeriodEvents,
    }
    while (dateToProcess <= nextPaymentDue) {
      currentPeriodEvents.push({
        effectiveDate: dateToProcess,
        streamId: facility.streamId,
        shouldProcessIfFuture: false,
        entityType: 'drawing',
        type: 'CalculateFixedDrawingAccrual',
        eventData: { ...option, accrualId: id },
      })
      // Naive date management - not suitable for production
      dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
    }
    allAccruals.push(accrualWithEvents)
  }
  return allAccruals
}

// export const getMarketDrawingAccrualEvents: GetDrawingAccrualEventsStrategy<
//   MarketDrawingAccrualStrategyOption
// > = (facility, option) => {
//   const expiryDate = new Date(option.expiryDate)
//   let dateToProcess = new Date(option.effectiveDate)

//   const drawingAccrualEvents: CalculateDrawingAccrualEvent[] = []
//   while (dateToProcess <= expiryDate) {
//     drawingAccrualEvents.push({
//       effectiveDate: dateToProcess,
//       streamId: facility.streamId,
//       shouldProcessIfFuture: false,
//       entityType: 'drawing',
//       type: 'CalculateMarketDrawingAccrual',
//       eventData: option,
//     })
//     // Naive date management - not suitable for production
//     dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
//   }
//   return drawingAccrualEvents
// }

type DrawingAccrualEventStrategies = {
  FixedDrawingAccrual: GetDrawingAccrualEventsStrategy<
    Extract<DrawingAccrualStrategyOption, { name: 'FixedDrawingAccrual' }>
  >
}

export const drawingAccrualEventStrategies: DrawingAccrualEventStrategies = {
  FixedDrawingAccrual: getFixedDrawingAccrualEvents,
  // MarketDrawingAccrual: getMarketDrawingAccrualEvents,
}
