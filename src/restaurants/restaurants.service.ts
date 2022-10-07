import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from 'src/restaurants/dtos/create-restaurant.dto';
import { Category } from 'src/restaurants/entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from 'src/restaurants/dtos/edit-restaurant.dto';
import { CategoryRepository } from 'src/restaurants/repositories/category.repository';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from 'src/restaurants/dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from 'src/restaurants/dtos/all-categories.dto';
import { CategoryOutput } from 'src/restaurants/dtos/category.dto';
import { CategoryInput } from './dtos/category.dto';
import { AMOUNT_PER_PAGE } from 'src/common/common.constants';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  RestaurantInput,
  RestaurantOutput,
} from 'src/restaurants/dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from 'src/restaurants/dtos/search-restaurant.dto';
import {
  CreateDishInput,
  CreateDishOutput,
} from 'src/restaurants/dtos/create-dish.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import {
  EditDishInput,
  EditDishOutput,
} from 'src/restaurants/dtos/edit-dish.dto';
import {
  DeleteDishInput,
  DeleteDishOutput,
} from 'src/restaurants/dtos/delete-dish.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from 'src/restaurants/dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from 'src/restaurants/dtos/my-restaurants.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
  ) {}
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;

      newRestaurant.category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );

      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return { ok: false, error: 'Could not create a restaurant' };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurantInput.restaurantId },
      });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not edit the restaurant' };
    }
  }
  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }

      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not delete the restaurant' };
    }
  }
  async getAllCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load the categories',
      };
    }
  }

  countRestaurants(slug: string): Promise<number> {
    return this.restaurants.count({ where: { category: { slug } } });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { slug },
      });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      const restaurants = await this.restaurants.find({
        where: { category: { slug } },
        take: AMOUNT_PER_PAGE,
        skip: --page * AMOUNT_PER_PAGE,
        order: {
          isPromoted: 'DESC',
        },
      });

      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category.slug);

      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / AMOUNT_PER_PAGE),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load this category',
      };
    }
  }
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        relations: ['category'],
        skip: --page * AMOUNT_PER_PAGE,
        take: AMOUNT_PER_PAGE,
        order: {
          isPromoted: 'DESC',
        },
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / AMOUNT_PER_PAGE),
        totalResults,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restarauntId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restarauntId },
        relations: ['menu', 'category'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant is not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurant',
      };
    }
  }

  async findRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: ILike(`%${query}%`) },
        skip: --page * AMOUNT_PER_PAGE,
        take: AMOUNT_PER_PAGE,
        relations: ['category'],
      });

      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / AMOUNT_PER_PAGE),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not search for restaurants',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: createDishInput.restaurantId },
      });

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      if (owner.id !== (await restaurant).ownerId) {
        return {
          ok: false,
          error: 'You can not create a dish in restaurant not to own',
        };
      }
      await this.dishes.save(
        this.dishes.create({
          ...createDishInput,
          restaurant,
        }),
      );

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create a dish' };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: editDishInput.dishId },
        relations: ['restaurant'],
      });

      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }
      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a dish in the restaurant that you don't own",
        };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
          options: editDishInput.options && [
            ...editDishInput.options.map((o) => ({ ...o })),
          ],
        },
      ]);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not edit a dish' };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: dishId },
        relations: ['restaurant'],
      });

      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }
      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a dish in the restaurant that you don't own",
        };
      }
      await this.dishes.delete(dishId);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not edit a dish' };
    }
  }

  async myRestaurants(owner: User, { page = 1 }): Promise<MyRestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { owner: { id: owner.id } },
        skip: --page * AMOUNT_PER_PAGE,
        take: AMOUNT_PER_PAGE,
        order: {
          isPromoted: 'DESC',
        },
      });

      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResults / AMOUNT_PER_PAGE),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }
  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { ownerId: owner.id, id },
        relations: ['menu', 'orders'],
      });
      return {
        restaurant,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }
}
