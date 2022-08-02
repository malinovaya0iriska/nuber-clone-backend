import { Module } from '@nestjs/common';
import { RestaurantResolver } from 'src/restaurants/restaurants.resolver';

@Module({
  providers: [RestaurantResolver],
})
export class RestaurantsModule {}
