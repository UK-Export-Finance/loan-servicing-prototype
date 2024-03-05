import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Render,
} from '@nestjs/common'
import { drawingToDrawingSummary } from 'mappers/nunjuck-mappers/drawingSummary'
import { DrawingNjkInput } from 'templates/drawing'
import DrawingService from './drawing.service'

@Controller('facility/:facilityId/drawing')
class DrawingController {
  constructor(private drawingService: DrawingService) {}

  // @Get('facility/:facilityId/drawing/new')
  // @Render('create-facility')
  // async renderCreateFacilityPage(
  //   @Query('facilityType') facilityTypeName: string,
  //   @Query('repaymentStrategy') repaymentStrategy: RepaymentStrategyName,
  //   @Query('calculateInterestStrategy')
  //   calculateInterestStrategy: CalculateInterestStrategyName,
  // ): Promise<CreateFacilityNjkInput> {
  //   const facilityType = await tryGetApiData<FacilityType>(
  //     `facility-type/${facilityTypeName}`,
  //   )
  //   if (!facilityType) {
  //     throw new Error('No facility type found')
  //   }
  //   return {
  //     calculateInterestStrategy,
  //     repaymentStrategy,
  //     facilityType: facilityTypeName,
  //   }
  // }

  // @Get('facility/new/start')
  // @Render('new-facility-strategies')
  // async renderFacilityStrategySelectionPage(
  //   @Query('facilityType') facilityTypeName: string,
  // ): Promise<ConfigureFacilityStrategiesNjkInput> {
  //   const facilityType = await tryGetApiData<FacilityType>(
  //     `facility-type/${facilityTypeName}`,
  //   )
  //   if (!facilityType) {
  //     throw new Error('No facility type found')
  //   }
  //   return {
  //     calculateInterestStrategyNames: filterSelectOptions(
  //       calculateInterestSelectOptions,
  //       facilityType.interestStrategies,
  //     ),
  //     repaymentStrategyNames: filterSelectOptions(
  //       repaymentsSelectOptions,
  //       facilityType.repaymentsStrategies,
  //     ),
  //     facilityType: facilityTypeName,
  //   }
  // }

  // @Get()
  // @Render('facility-list')
  // async renderAllFacilities(): Promise<FacilityListNjkInput> {
  //   const allFacilities = await tryGetApiData<DrawingDto[]>('facility')
  //   const allFacilityTypes =
  //     await tryGetApiData<FacilityType[]>('facility-type')
  //   return {
  //     allFacilities,
  //     allFacilityTypes,
  //     facilityTypeNames:
  //       allFacilityTypes?.map((t) => ({
  //         value: t.name,
  //         text: t.name,
  //       })) ?? [],
  //   }
  // }

  @Get(':drawingId')
  @Render('drawing')
  async renderDrawingPage(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('drawingCreated') drawingCreated?: boolean,
  ): Promise<DrawingNjkInput> {
    const drawing = await this.drawingService.getDrawing(facilityId, drawingId)
    if (!drawing) {
      throw new NotFoundException()
    }
    const events = await this.drawingService.getDrawingEventTableRows(
      facilityId,
      drawingId,
    )
    const transactionRows = await this.drawingService.getDrawingTransactionRows(
      facilityId,
      drawingId,
    )

    return {
      drawing,
      eventRows: events!,
      drawingCreated,
      transactionRows: transactionRows!,
      drawingSummaryListProps: drawingToDrawingSummary(drawing),
    }
  }

  // @Post('')
  // async createFacility(
  //   @Body() requestDto: NewFacilityRequestFormDto,
  //   @Res() response: Response,
  // ): Promise<void> {
  //   const newFacilityRequest: NewFacilityRequestDto =
  //     mapCreateFacilityFormToRequest(requestDto)
  //   const newFacility =
  //     await this.facilityService.createFacility(newFacilityRequest)
  //   if (!newFacility) {
  //     throw new Error('Failed to create facility')
  //   }
  //   const newDrawingRequest = mapCreateFacilityFormToCreateDrawing(
  //     requestDto,
  //     newFacility.streamId,
  //   )
  //   await this.drawingService.createDrawing(newDrawingRequest)
  //   response.redirect(`/facility/${newFacility?.streamId}?facilityCreated=true`)
  // }
}

export default DrawingController
