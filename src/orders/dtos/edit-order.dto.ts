import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core-output.dto';
import { Order } from 'src/orders/entities/order.entity';

@InputType()
export class EditOrderInput extends PickType(Order, ['id', 'orderStatus']) {}

@ObjectType()
export class EditOrderOutput extends CoreOutput {}
