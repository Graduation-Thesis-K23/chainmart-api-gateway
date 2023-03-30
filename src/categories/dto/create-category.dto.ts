import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
