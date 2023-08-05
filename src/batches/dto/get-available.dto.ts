import { IsArray } from "class-validator";

export class GetAvailableDto {
  @IsArray()
  product_id: string[];
}
