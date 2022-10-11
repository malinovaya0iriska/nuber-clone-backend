import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import * as Joi from 'joi';

import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { Verification } from 'src/users/entities/verification.entity';
import { MailModule } from 'src/mail/mail.module';
import { Category } from 'src/restaurants/entities/category.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/order-items.entity';
import { CommonModule } from 'src/common/common.module';
import { TOKEN_KEY } from 'src/common/common.constants';
import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from 'src/payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';

// console.log('JOI', Joi);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [
        Restaurant,
        User,
        Verification,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: process.env.NODE_ENV !== 'prod',
      autoSchemaFile: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
          onConnect: (connectionParams): { token: string } => {
            return { token: connectionParams[TOKEN_KEY] };
          },
        },
      },
      context: (params): { token: string } => {
        const { req } = params;

        return {
          token: req.headers[TOKEN_KEY],
        };
      },
    }),
    ScheduleModule.forRoot(),
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    AuthModule,
    RestaurantsModule,
    UsersModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
