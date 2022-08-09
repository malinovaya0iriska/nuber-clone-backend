import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from 'src/users/dtos/create-account.dto';
import { LoginInput, LoginOutput } from 'src/users/dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import {
  EditProfileInput,
  EditProfileOutput,
} from 'src/users/dtos/edit-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
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
      const token = this.jwtService.sign(user.id);
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error: "Could't log in. Try again later." };
    }
  }
  async findUserById(id: number): Promise<User> {
    return this.users.findOneBy({ id });
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    const user: User = await this.users.findOneBy({ id: userId });
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user);
  }
}
