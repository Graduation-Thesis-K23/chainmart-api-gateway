import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
