import { IsNotEmpty, IsString } from "class-validator";
import { Role } from "~/shared";

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: Role;
}
