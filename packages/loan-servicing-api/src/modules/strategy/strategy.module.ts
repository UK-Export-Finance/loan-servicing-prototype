import { Module } from '@nestjs/common'
import StrategyService from './strategy.service'
import CalculateInterestService from './calculateInterest/service'

@Module({
  imports: [],
  providers: [
    CalculateInterestService,
    StrategyService
  ],
  exports: [StrategyService],
})
class StrategyModule {}

export default StrategyModule
