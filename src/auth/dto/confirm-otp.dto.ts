import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmOtp {
  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
