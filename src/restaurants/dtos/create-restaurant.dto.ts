import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
