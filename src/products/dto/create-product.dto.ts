import { Type } from "class-transformer";
import { IsBoolean, IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  product_code: string;

  @IsUUID(4)
  @IsNotEmpty()
  supplier_id: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  sale?: number;

  @IsJSON()
  @IsNotEmpty()
  specifications: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  acceptable_expiry_threshold?: number;

  @IsBoolean()
  @IsOptional()
  show: boolean;
}
