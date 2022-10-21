import { InputType, ObjectType, Field, PickType } from '@nestjs/graphql';
import { PaginationOutput } from 'src/common/dtos/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType()
export class RestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class RestaurantOutput extends PaginationOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
