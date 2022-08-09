import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from 'src/users/dtos/create-account.dto';
import { LoginInput, LoginOutput } from 'src/users/dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from 'src/users/dtos/edit-profile.dto';
import { Verification } from 'src/users/entities/verification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
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

      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(this.verifications.create({ user }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Could't create an account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const users: User[] = await this.users.find({
        where: {
          email,
        },
        select: { password: true, id: true },
      });

      const user = users.pop();
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

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.find({
        relations: ['user'],
      });
      if (verification.length) {
        const user = verification.pop().user;
        user.verified = true;
        this.users.save(user);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
