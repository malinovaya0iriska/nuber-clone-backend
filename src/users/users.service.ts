import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from 'src/users/dtos/create-account.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async createAccountSer({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<[boolean, string?]> {
    try {
      const isExisted = await this.users.findOneBy({ email });
      if (isExisted) {
        return [false, 'User with this email has been registered'];
      }

      await this.users.save(this.users.create({ email, password, role }));

      return [true];
    } catch (e) {
      return [false, "Could't create an account"];
    }
  }
}
