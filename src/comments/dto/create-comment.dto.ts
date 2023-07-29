import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  star: number;

  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
