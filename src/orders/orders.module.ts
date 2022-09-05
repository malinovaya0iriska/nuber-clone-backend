import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './orders.service';
import { OrderItem } from 'src/orders/order-items.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderResolver } from 'src/orders/orders.resolver';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
