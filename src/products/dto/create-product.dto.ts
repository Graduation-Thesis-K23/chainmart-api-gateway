import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  supplier: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsDateString({ strict: true })
  expiry_date: string;

  @IsNumber()
  @Min(0)
  units_in_stocks: number;

  @IsNumber()
  @Min(0)
  units_on_orders: number;

  @IsNumber()
  @IsOptional()
  sale: number;
}
