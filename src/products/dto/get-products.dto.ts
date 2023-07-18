import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class GetProductsDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  page?: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
