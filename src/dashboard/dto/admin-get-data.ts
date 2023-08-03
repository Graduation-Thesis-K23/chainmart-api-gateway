import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { DashboardType } from "~/shared";

export class AdminGetDataDto {
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  branch: string;

  @IsEnum(DashboardType)
  dashboardType: DashboardType;
}
