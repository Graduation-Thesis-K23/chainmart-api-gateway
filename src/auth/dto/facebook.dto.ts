import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class FacebookDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
