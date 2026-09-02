import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlan } from './entities/payment-plan.entity.js';
import { Installment } from './entities/installment.entity.js';
import { Payment } from './entities/payment.entity.js';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentPlan, Installment, Payment])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
