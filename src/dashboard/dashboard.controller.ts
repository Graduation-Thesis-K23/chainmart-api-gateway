import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { Role } from "~/shared";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { GetDashboardDataBranchDto } from "./dto/get-dashboard-data-branch.dto";

@Controller("dashboard")
@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.Admin)
  @Get()
  getDashboardDataAdmin(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getDashboardDataAdmin(getDashboardDataDto);
  }

  @Roles(Role.Branch)
  @Get("/branch")
  getDashboardDataBranch(@Query() getDashboardDataDto: GetDashboardDataBranchDto) {
    return this.dashboardService.getDashboardDataBranch(getDashboardDataDto);
  }
}
