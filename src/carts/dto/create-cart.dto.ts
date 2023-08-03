import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class CreateCartDto {
  @IsUUID(4)
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => CartDetailParam)
  cart_details: CartDetailParam[];
}

export class CartDetailParam {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
