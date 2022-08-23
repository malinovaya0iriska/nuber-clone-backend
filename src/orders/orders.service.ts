import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateOrderInput,
  CreateOrderOutput,
} from 'src/orders/dtos/create-order.dto';
import { Order } from 'src/orders/entities/order.entity';
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
        console.log(orderFinalPrice, dishFinalPrice);
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
      console.log(order);

      let haveAccessToGet = true;
      if (user.role === UserRole.Client && order.customerID !== user.id) {
        haveAccessToGet = false;
      }
      if (user.role === UserRole.Delivery && order.driverID !== user.id) {
        haveAccessToGet = false;
      }
      if (
        user.role === UserRole.Owner &&
        order.restaurant.ownerId !== user.id
      ) {
        console.log(order.restaurant);

        haveAccessToGet = false;
      }
      if (!haveAccessToGet) {
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
}
