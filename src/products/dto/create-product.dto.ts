import { Type } from "class-transformer";
import { IsDateString, IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID(4)
  @IsNotEmpty()
  supplier: string;

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
}
