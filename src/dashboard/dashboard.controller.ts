import { BadRequestException, Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { DashboardService } from "./dashboard.service";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { EmployeePayload, Role } from "~/shared";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { AdminGetDataDto } from "./dto/admin-get-data";
import { BranchGetDataDto } from "./dto/branch-get-data";

@Controller("dashboard")
@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.Admin)
  @Get()
  getDashboardDataAdmin(@Query() adminGetDataDto: AdminGetDataDto) {
    try {
      return this.dashboardService.getDashboardDataAdmin(adminGetDataDto);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  @Roles(Role.Branch)
  @Get("/branch")
  getDashboardDataBranch(@Query() branchGetDataDto: BranchGetDataDto, @Req() req: Request) {
    try {
      const user = req.user as EmployeePayload;

      return this.dashboardService.getDashboardDataBranch(user.phone, branchGetDataDto);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }
}
