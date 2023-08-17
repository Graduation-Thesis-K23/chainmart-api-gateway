import { IsBoolean, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsNotEmpty()
  branch_id: string;
}
