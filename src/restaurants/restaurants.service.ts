import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRestaurantDto } from 'src/restaurants/dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from 'src/restaurants/dtos/update-restaurant.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const newRestaurant = this.restaurants.create(createRestaurantDto);
    return this.restaurants.save(newRestaurant);
  }

  updateRestaurant({ id, data }: UpdateRestaurantDto): Promise<UpdateResult> {
    return this.restaurants.update(id, { ...data });
  }
}
