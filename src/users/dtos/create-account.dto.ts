import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { MutationOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends MutationOutput {}
