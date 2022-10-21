import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payments/entities/payment.entity';
import { PaymentResolver } from 'src/payments/payment.resolver';
import { PaymentService } from 'src/payments/payment.service';
import { PaymentsController } from 'src/payments/payments.controller';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentService, PaymentResolver],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
