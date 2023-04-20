import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class GoogleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  avatar: string;
}
