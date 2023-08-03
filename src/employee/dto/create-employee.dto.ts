import { IsNotEmpty, IsString } from "class-validator";
import { Role } from "~/shared";

export class CreateEmployeeDto {
  @IsString()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  role: Role;
}
