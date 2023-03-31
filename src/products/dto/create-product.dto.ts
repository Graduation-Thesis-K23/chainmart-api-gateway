import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID(4)
  @IsNotEmpty()
  supplier: string;

  @IsUUID(4)
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsDateString({ strict: true })
  expiry_date: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  units_in_stocks: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  units_on_orders: number;

  @IsNumber()
  @IsOptional()
  sale: number;
}
