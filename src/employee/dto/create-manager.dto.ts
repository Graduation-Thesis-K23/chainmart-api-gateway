import { OmitType } from "@nestjs/mapped-types";
import { CreateEmployeeDto } from "./create-employee.dto";

export class CreateManagerDto extends OmitType(CreateEmployeeDto, ["role", "password"]) {}
