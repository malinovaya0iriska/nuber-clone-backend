import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';
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
import { Category } from 'src/restaurants/entities/category.entity';
import { AllCategoriesOutput } from 'src/restaurants/dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsOutput } from 'src/restaurants/dtos/restaurants.dto';
import { RestaurantsInput } from './dtos/restaurants.dto';
import {
  RestaurantOutput,
  RestaurantInput,
} from 'src/restaurants/dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from 'src/restaurants/dtos/search-restaurant.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { CreateDishOutput } from 'src/restaurants/dtos/create-dish.dto';
import { CreateDishInput } from './dtos/create-dish.dto';
import {
  EditDishOutput,
  EditDishInput,
} from 'src/restaurants/dtos/edit-dish.dto';
import {
  DeleteDishInput,
  DeleteDishOutput,
} from 'src/restaurants/dtos/delete-dish.dto';
import {
  MyRestaurantsInput,
  MyRestaurantsOutput,
} from 'src/restaurants/dtos/my-restaurants.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from 'src/restaurants/dtos/my-restaurant.dto';

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
  @Query((returns) => MyRestaurantsOutput)
  @Role(['Owner'])
  myRestaurants(
    @AuthUser() owner: User,
    @Args('input') myRestaurantsInput: MyRestaurantsInput,
  ): Promise<MyRestaurantsOutput> {
    return this.restaurantService.myRestaurants(owner, myRestaurantsInput);
  }

  @Query((returns) => MyRestaurantOutput)
  @Role(['Owner'])
  myRestaurant(
    @AuthUser() owner: User,
    @Args('input') myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.restaurantService.myRestaurant(owner, myRestaurantInput);
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

  @Query((returns) => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }
}

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() { slug }: Category): Promise<number> {
    return this.restaurantService.countRestaurants(slug);
  }

  @Query((returns) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.getAllCategories();
  }

  @Query((returns) => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }

  @Query((returns) => RestaurantOutput)
  restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query((returns) => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.findRestaurantByName(searchRestaurantInput);
  }
}

@Resolver((of) => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((type) => CreateDishOutput)
  @Role(['Owner'])
  async createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation((type) => EditDishOutput)
  @Role(['Owner'])
  async editeDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation((type) => EditDishOutput)
  @Role(['Owner'])
  async deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}
