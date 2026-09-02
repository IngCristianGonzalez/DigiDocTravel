import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payment-plans')
  @Roles('admin', 'consultor')
  async createPlan(@Body() dto: CreatePlanDto, @Req() req: any) {
    return this.paymentsService.createPlan(dto, req.user.id);
  }

  @Get('payment-plans')
  async findAll(@Query() query: any) {
    return this.paymentsService.findAll(query);
  }

  @Get('payment-plans/pending')
  async pending() {
    return this.paymentsService.findPending();
  }

  @Get('payment-plans/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('payment-plans/:id/installments')
  async installments(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.getInstallments(id);
  }

  @Post('installments/:id/pay')
  @Roles('admin', 'consultor')
  async pay(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.registerPayment(id, dto, req.user.id);
  }
}
