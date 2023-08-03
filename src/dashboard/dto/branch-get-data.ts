import { OmitType } from "@nestjs/mapped-types";
import { AdminGetDataDto } from "./admin-get-data";

export class BranchGetDataDto extends OmitType(AdminGetDataDto, ["branch"] as const) {}
