import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

enum SortBy {
  ASC = "asc",
  DESC = "desc",
  LATEST = "latest",
  SALES = "sales",
}

export class SearchAndFilterQueryDto {
  @IsString()
  @IsOptional()
  categories?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsEnum(SortBy)
  @IsOptional()
  orderBy?: SortBy;

  @IsString()
  keyword: string;
}
