import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType({ isAbstract: true })
export class CreateAccountOutput {
  @Field((type) => Boolean)
  ok: boolean;

  @Field((type) => String, { nullable: true })
  error?: string;
}
