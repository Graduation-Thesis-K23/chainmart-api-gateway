import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "src/shared";

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
