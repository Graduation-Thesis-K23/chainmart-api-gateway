import { PartialType } from "@nestjs/mapped-types";
import { CreateProductDto } from "./create-product.dto";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsBoolean()
  @IsNotEmpty()
  show: boolean;
}
