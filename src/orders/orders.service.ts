import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateOrderInput,
  CreateOrderOutput,
} from 'src/orders/dtos/create-order.dto';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { OrderItem } from 'src/orders/order-items.entity';
import {
  GetOrdersInput,
  GetOrdersOutput,
} from 'src/orders/dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from 'src/orders/dtos/get-order.dto';
import {
  EditOrderInput,
  EditOrderOutput,
} from 'src/orders/dtos/edit-order.dto';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne({ where: { id: item.dishId } });
        if (!dish) {
          return {
            ok: false,
            error: 'Dish was not found.',
          };
        }
        let dishFinalPrice = dish.price;

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices?.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });

      return {
        ok: true,
        orderId: order.id,
      };
    } catch (error) {
      console.log(error);
      return { ok: false, error: "Couldn't create an order" };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: { driver: { id: user.id }, orderStatus: status },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: { id: user.id },
            ...(status && { orderStatus: status }),
          },
          relations: ['orders'],
        });
        orders = restaurants.map(({ orders }) => orders).flat(1);

        if (status) {
          orders = orders.filter(({ orderStatus }) => orderStatus === status);
        }
      } else if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: { id: user.id },
            ...(status && { orderStatus: status }),
          },
        });
      }

      return {
        ok: true,
        orders,
      };
    } catch (error) {
      console.log(error);
      return { ok: false, error: "Couldn't get orders" };
    }
  }

  haveUserAccess(user: User, order: Order): boolean {
    let haveAccess = true;
    if (user.role === UserRole.Client && order.customerID !== user.id) {
      haveAccess = false;
    }
    if (user.role === UserRole.Delivery && order.driverID !== user.id) {
      haveAccess = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      haveAccess = false;
    }
    return haveAccess;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOneBy({ id: orderId });
      if (!order) {
        return {
          ok: false,
          error: 'Order was not found',
        };
      }

      if (!this.haveUserAccess(user, order)) {
        return {
          ok: false,
          error: 'You have no access to get this information',
        };
      }
      return { ok: true, order };
    } catch (error) {
      console.log(error);
      return { ok: false, error: "Couldn't get the order" };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, orderStatus: status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: orderId },
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order was not found',
        };
      }
      if (!this.haveUserAccess(user, order)) {
        return {
          ok: false,
          error: 'You have no access to get this information',
        };
      }
      let canEdit = true;
      if (user.role === UserRole.Client) {
        canEdit = false;
      }
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          ok: false,
          error: 'You have no access to edit the order',
        };
      }
      await this.orders.save([
        {
          id: orderId,
          orderStatus: status,
        },
      ]);

      const newOrder = { ...order, status };

      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          await this.pubSub.publish(NEW_COOKED_ORDER, {
            cookedOrders: newOrder,
          });
        }
      }
      await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: "Couldn't edit the order" };
    }
  }
}
