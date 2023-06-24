import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class CreateBatchDto {
  @IsUUID(4)
  @IsNotEmpty()
  product_id: string;

  @IsNumber()
  @IsNotEmpty()
  import_quantity: number;

  @IsNumber()
  @IsNotEmpty()
  import_cost: number;

  @IsNumber()
  @IsNotEmpty()
  acceptable_expiry_threshold: number;

  @IsUUID(4)
  @IsNotEmpty()
  branch_id: string;

  @IsUUID(4)
  @IsNotEmpty()
  employee_create_id: string;
}
