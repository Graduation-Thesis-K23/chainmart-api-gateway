import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Role } from "~/shared";

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
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
