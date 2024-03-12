import { LoanServicingEvent } from '../interfaces/events'

type HasEffectiveDate = Pick<LoanServicingEvent, 'effectiveDate'>

// eslint-disable-next-line import/prefer-default-export
export const sortEventByEffectiveDate = (
  a: HasEffectiveDate,
  b: HasEffectiveDate,
): number => a.effectiveDate.getTime() - b.effectiveDate.getTime()
