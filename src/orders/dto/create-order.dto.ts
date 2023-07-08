import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Payment } from "src/shared";

export class CreateOrderDto {
  @IsUUID(4)
  @IsNotEmpty()
  user_id: string;

  @IsUUID(4)
  @IsNotEmpty()
  address_id: string;

  @IsEnum(Payment)
  payment: Payment;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => OrderDetailParam)
  order_details: OrderDetailParam[];
}

class OrderDetailParam {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
