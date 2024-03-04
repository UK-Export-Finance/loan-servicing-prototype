import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Query,
    Render,
    Res,
  } from '@nestjs/common'
  import { Response } from 'express'
  import {
      AddWithdrawalToDrawingDto,
    AdjustFacilityAmountDto,
    UpdateDrawingInterestRequestDto,
  } from 'loan-servicing-common'
  import FacilityService from 'modules/facility/facility.service'
  import {
    AmendPrincipalNjkInput,
    FacilityPrincipalAdjustmentFormDto,
  } from 'templates/facility-edit/amend-principal'
  import { getDateFromDateInput } from 'utils/form-helpers'
  import { FacilityInterestRateUpdateFormDto } from 'templates/facility-edit/change-interest'
import { AddDrawingFormDto, AddDrawingNjkInput } from 'templates/facility-edit/add-drawing'
  
  @Controller('facility')
  class EditFacilityController {
    constructor(private facilityService: FacilityService) {}
  
    @Get(':id/adjustPrincipal')
    @Render('facility-edit/amend-principal')
    async renderPrincipalAdjustmentPage(
      @Param('id') id: string,
    ): Promise<AmendPrincipalNjkInput> {
      const facility = await this.facilityService.getFacility(id)
      if (!facility) {
        throw new NotFoundException()
      }
      const events = await this.facilityService.getFacilityEventTableRows(id)
      const transactionRows =
        await this.facilityService.getFacilityTransactionRows(id)
  
      return {
        facility,
        eventRows: events!,
        transactionRows: transactionRows!,
      }
    }
  
    @Post(':id/adjustprincipal')
    async addPrincipalAdjustment(
      @Param('id') id: string,
      @Query('version') version: string,
      @Body()
      requestDto: FacilityPrincipalAdjustmentFormDto,
      @Res() response: Response,
    ): Promise<void> {
      const adjustmentDto: AdjustFacilityAmountDto = {
        effectiveDate: getDateFromDateInput(
          requestDto,
          'effectiveDate',
        ).toISOString(),
        adjustment: requestDto.adjustment,
      }
      await this.facilityService.adjustPrincipal(id, version, adjustmentDto)
      response.redirect(`/facility/${id}`)
    }

    @Get(':id/drawing')
    @Render('facility-edit/add-drawing')
    async renderAddDrawingPage(
      @Param('id') id: string,
    ): Promise<AddDrawingNjkInput> {
      const facility = await this.facilityService.getFacility(id)
      if (!facility) {
        throw new NotFoundException()
      }
      const events = await this.facilityService.getFacilityEventTableRows(id)
      const transactionRows =
        await this.facilityService.getFacilityTransactionRows(id)
  
      return {
        facility,
        eventRows: events!,
        transactionRows: transactionRows!,
      }
    }
  
    @Post(':id/drawing')
    async addDrawing(
      @Param('id') id: string,
      @Query('version') version: string,
      @Body()
      requestDto: AddDrawingFormDto,
      @Res() response: Response,
    ): Promise<void> {
      const addDrawingDto: AddWithdrawalToDrawingDto = {
        date: getDateFromDateInput(
          requestDto,
          'date',
        ),
        amount: requestDto.amount,
      }
      await this.facilityService.addDrawing(id, version, addDrawingDto)
      response.redirect(`/facility/${id}`)
    }
  
    @Get(':id/changeInterest')
    @Render('facility-edit/change-interest')
    async renderInterestChangePage(
      @Param('id') id: string,
    ): Promise<AmendPrincipalNjkInput> {
      const facility = await this.facilityService.getFacility(id)
      if (!facility) {
        throw new NotFoundException()
      }
      const events = await this.facilityService.getFacilityEventTableRows(id)
      const transactionRows =
        await this.facilityService.getFacilityTransactionRows(id)
  
      return {
        facility,
        eventRows: events!,
        transactionRows: transactionRows!,
      }
    }
  
    @Post(':id/changeInterest')
    async updateInterest(
      @Param('id') id: string,
      @Query('version') version: string,
      @Body()
      requestDto: FacilityInterestRateUpdateFormDto,
      @Res() response: Response,
    ): Promise<void> {
      const updateDto: UpdateDrawingInterestRequestDto = {
        effectiveDate: getDateFromDateInput(
          requestDto,
          'effectiveDate',
        ).toISOString(),
        interestRate: requestDto.interestRate,
      }
      await this.facilityService.updateInterest(id, version, updateDto)
      response.redirect(`/facility/${id}`)
    }
  }
  
  export default EditFacilityController
  