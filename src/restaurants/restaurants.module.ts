import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from 'src/customRepository/typeorm-ex.module';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CategoryRepository } from 'src/restaurants/repositories/category.repository';
import {
  CategoryResolver,
  DishResolver,
  RestaurantResolver,
} from 'src/restaurants/restaurants.resolver';
import { RestaurantService } from 'src/restaurants/restaurants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Dish]),
    TypeOrmExModule.forCustomRepository([CategoryRepository]),
  ],
  providers: [
    RestaurantResolver,
    RestaurantService,
    CategoryResolver,
    DishResolver,
  ],
})
export class RestaurantsModule {}
