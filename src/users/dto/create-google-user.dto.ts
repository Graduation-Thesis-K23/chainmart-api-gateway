import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { OmitType } from "@nestjs/mapped-types";

import { CreateUserDto } from "./create-user.dto";

export class CreateGoogleUserDto extends OmitType(CreateUserDto, ["password"]) {
  @IsString()
  @IsNotEmpty()
  photo: string;

  @IsBoolean()
  @IsNotEmpty()
  hasEmailVerify: boolean;
}
