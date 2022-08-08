import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from 'src/users/dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { LoginOutput } from 'src/users/dtos/login.dto';

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
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const isExisted: User = await this.users.findOneBy({ email });
      if (isExisted) {
        return { ok: false, error: 'User with this email has been registered' };
      }

      await this.users.save(this.users.create({ email, password, role }));

      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Could't create an account" };
    }
  }
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user: User = await this.users.findOneBy({ email });
      if (!user) {
        return { ok: false, error: 'User not found' };
      }

      const isPasswodCorrect = await user.checkPassword(password);
      if (!isPasswodCorrect) {
        return { ok: false, error: 'Wrong password' };
      }
      return { ok: true, token: 'lalala' };
    } catch (error) {
      return { ok: false, error: "Could't log in. Try again later." };
    }
  }
}
