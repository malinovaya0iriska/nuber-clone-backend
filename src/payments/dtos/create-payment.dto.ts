import { InputType, PickType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core-output.dto';
import { Payment } from 'src/payments/entities/payment.entity';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionID',
  'restaurantID',
]) {}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}
