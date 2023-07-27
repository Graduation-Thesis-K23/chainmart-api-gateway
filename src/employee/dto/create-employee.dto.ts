import { IsEnum, IsNotEmpty, IsString } from "class-validator";

enum Role {
  Employee = "EMPLOYEE",
  Shipper = "SHIPPER",
}

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
