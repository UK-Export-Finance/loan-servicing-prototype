import {
  CalculateInterestStrategy,
  calculatePrincipalOnlyInterest,
} from './calculateInterestStrategy'

export type FacilityContext = {
  calculateInterest: CalculateInterestStrategy
}

const createFacilityContext = (): FacilityContext => ({
  calculateInterest: calculatePrincipalOnlyInterest,
})

export default createFacilityContext
