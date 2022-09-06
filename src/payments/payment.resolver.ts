import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  CreatePaymentInput,
  CreatePaymentOuput,
} from 'src/payments/dtos/create-payment.dto';
import { Payment } from 'src/payments/entities/payment.entity';
import { PaymentService } from 'src/payments/payment.service';
import { User } from 'src/users/entities/user.entity';

@Resolver((of) => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation((returns) => CreatePaymentOuput)
  @Role(['Owner'])
  async createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOuput> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }
}
