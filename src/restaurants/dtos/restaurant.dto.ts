import { InputType, ObjectType, Field } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType()
export class RestaurantInput extends PaginationInput {
  @Field((type) => Number)
  restarauntId: number;
}

@ObjectType()
export class RestaurantOutput extends PaginationOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
