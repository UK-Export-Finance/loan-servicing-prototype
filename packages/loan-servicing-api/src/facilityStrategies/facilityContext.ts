import calculateInterestStrategies, {
  CalculateInterestStrategy,
  CalculateInterestStrategyName,
} from './calculateInterestStrategy'

export type FacilityContext = {
  calculateInterest: CalculateInterestStrategy
}

export type FacilityContextOptions = {
    calculateInterest: CalculateInterestStrategyName
}

const createFacilityContext = (options: FacilityContextOptions): FacilityContext => ({
  calculateInterest: calculateInterestStrategies[options.calculateInterest],
})

export default createFacilityContext
