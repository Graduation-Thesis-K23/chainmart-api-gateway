import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CommentOrderDto {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  star: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;
}
