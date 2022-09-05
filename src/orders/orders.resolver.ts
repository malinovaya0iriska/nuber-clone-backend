import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { PUB_SUB } from 'src/common/common.constants';
import {
  CreateOrderInput,
  CreateOrderOutput,
} from 'src/orders/dtos/create-order.dto';
import {
  EditOrderInput,
  EditOrderOutput,
} from 'src/orders/dtos/edit-order.dto';
import { GetOrderOutput, GetOrderInput } from 'src/orders/dtos/get-order.dto';
import {
  GetOrdersInput,
  GetOrdersOutput,
} from 'src/orders/dtos/get-orders.dto';
import { Order } from 'src/orders/entities/order.entity';
import { OrderService } from 'src/orders/orders.service';
import { User } from 'src/users/entities/user.entity';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation((returns) => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Query((returns) => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  @Mutation((returns) => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput);
  }

  @Mutation((returns) => Boolean)
  async potatoReady() {
    await this.pubSub.publish('hotPotatos', {
      readyPotato: 'Your potato is ready!',
    });

    return true;
  }

  @Subscription((returns) => String, {
    name: 'hotPotatos',
  })
  @Role(['Client'])
  hotPotatos(@AuthUser() user: User) {
    console.log(user);

    return this.pubSub.asyncIterator('commentAdded');
  }
}
