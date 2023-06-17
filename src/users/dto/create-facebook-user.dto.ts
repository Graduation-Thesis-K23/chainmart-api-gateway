import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { OmitType } from "@nestjs/mapped-types";

import { CreateUserDto } from "./create-user.dto";

export class CreateFacebookUserDto extends OmitType(CreateUserDto, ["password", "email"]) {
  @IsString()
  @IsNotEmpty()
  facebook: string;

  @IsBoolean()
  @IsNotEmpty()
  hasFacebookVerify: boolean;
}
