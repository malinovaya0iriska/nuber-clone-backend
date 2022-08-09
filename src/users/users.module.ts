import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { UserResolver } from 'src/users/users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UsersModule {}
