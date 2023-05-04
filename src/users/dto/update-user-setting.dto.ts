import { IsEnum, IsOptional, IsString } from "class-validator";
import { Gender } from "../enums/gender.enum";

export class UpdateUserSettingDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  birthday?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;
}
