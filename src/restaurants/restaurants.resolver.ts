import { SetMetadata } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from 'src/restaurants/dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from 'src/restaurants/dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from 'src/restaurants/dtos/edit-restaurant.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantService } from 'src/restaurants/restaurants.service';
import { User } from 'src/users/entities/user.entity';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
  @Mutation((returns) => EditRestaurantOutput)
  @Role(['Owner'])
  async editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation((returns) => EditRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }
}
