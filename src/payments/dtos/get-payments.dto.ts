import { InputType, PickType, ObjectType, Field } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core-output.dto';
import { Payment } from 'src/payments/entities/payment.entity';

@ObjectType()
export class GetPaymentOutput extends CoreOutput {
  @Field((type) => [Payment], { nullable: true })
  payments?: Payment[];
}
