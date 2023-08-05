import { IsNotEmpty, IsUUID } from "class-validator";
import { CreateEmployeeDto } from "./create-employee.dto";
import { OmitType } from "@nestjs/mapped-types";

export class CreateManagerDto extends OmitType(CreateEmployeeDto, ["role"] as const) {
  @IsUUID()
  @IsNotEmpty()
  branch_id: string;
}
