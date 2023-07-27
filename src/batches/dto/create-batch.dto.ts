import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateBatchDto {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  import_quantity: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  import_cost: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  acceptable_expiry_threshold: number;

  @IsUUID(4)
  @IsNotEmpty()
  branch_id: string;

  @IsDateString()
  @IsNotEmpty()
  expiry_date: string;
}
