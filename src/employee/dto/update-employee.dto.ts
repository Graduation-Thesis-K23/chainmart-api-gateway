import { IsNotEmpty, IsString } from "class-validator";

export class UpdateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
