import { IsNotEmpty, IsUUID } from "class-validator";
import { CreateEmployeeDto } from "./create-employee.dto";

export class CreateManagerDto extends CreateEmployeeDto {
  @IsUUID()
  @IsNotEmpty()
  branch_id: string;
}
