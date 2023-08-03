import { OmitType } from "@nestjs/mapped-types";
import { GetDashboardDataDto } from "./get-dashboard-data.dto";

export class GetDashboardDataBranchDto extends OmitType(GetDashboardDataDto, ["branch"] as const) {}
