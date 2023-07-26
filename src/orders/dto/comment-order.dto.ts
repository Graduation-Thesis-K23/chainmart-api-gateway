import { Transform, Type } from "class-transformer";
import { IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CommentOrder {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @Transform((value) => Number(value))
  @IsNotEmpty()
  star: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class CommentOrderDto {
  @IsJSON()
  @IsNotEmpty()
  comments: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;
}
