import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
