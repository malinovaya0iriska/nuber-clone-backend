import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from 'src/users/dtos/create-account.dto';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Query((returns) => Boolean)
  hi() {
    return true;
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      console.log(createAccountInput);

      const [ok, error] = await this.usersService.createAccountSer(
        createAccountInput,
      );

      return { ok, error };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
