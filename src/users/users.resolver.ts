import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from 'src/users/dtos/create-account.dto';
import { LoginOutput } from 'src/users/dtos/login.dto';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { LoginInput } from 'src/users/dtos/login.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  UserProfileInput,
  UserProfileOutput,
} from 'src/users/dtos/user-profile.dto';
import { EditProfileOutput } from 'src/users/dtos/edit-profile.dto';
import { EditProfileInput } from './dtos/edit-profile.dto';
import {
  VerifyEmailInput,
  VerifyEmailOutput,
} from 'src/users/dtos/verify-email.dto';
import { Role } from 'src/auth/role.decorator';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Query((returns) => User)
  @Role(['Any'])
  me(@AuthUser() authorizedUser: User) {
    return authorizedUser;
  }

  @Query((returns) => UserProfileOutput)
  @Role(['Any'])
  async getUserProfile(
    @Args() { userId }: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findUserById(userId);
  }

  @Mutation((returns) => EditProfileOutput)
  @Role(['Any'])
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') EditProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, EditProfileInput);
  }

  @Mutation((returns) => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
