import { Type } from "class-transformer";
import { IsDateString, IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

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
  @IsOptional()
  sale: number;

  @IsJSON()
  @IsNotEmpty()
  options: string;

  @IsJSON()
  @IsNotEmpty()
  specifications: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
