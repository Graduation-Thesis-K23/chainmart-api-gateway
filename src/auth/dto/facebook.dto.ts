import { IsNotEmpty, IsString } from "class-validator";

export class FacebookDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  id: string;
}
