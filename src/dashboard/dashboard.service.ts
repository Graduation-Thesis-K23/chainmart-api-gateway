import { Injectable } from "@nestjs/common";

import { AdminGetDataDto } from "./dto/admin-get-data";
import { BranchGetDataDto } from "./dto/branch-get-data";
import { OrdersService } from "~/orders/orders.service";
import { UsersService } from "~/users/users.service";
import { DashboardType } from "~/shared";

@Injectable()
export class DashboardService {
  constructor(private readonly ordersService: OrdersService, private readonly userService: UsersService) {}

  getDashboardDataAdmin(adminGetDataDto: AdminGetDataDto) {
    console.log("adminGetDataDto", adminGetDataDto);
    const { startDate, endDate, branch } = adminGetDataDto;

    switch (adminGetDataDto.dashboardType) {
      case DashboardType.NewUser:
        return this.userService.getNewUserByDate(startDate, endDate);
      case DashboardType.HotSelling:
        return this.ordersService.getHotSellingProduct(startDate, endDate, branch);
      case DashboardType.OrdersDaily:
        return this.ordersService.getNumberOrdersPerDay(startDate, endDate, branch);
      case DashboardType.RevenueDaily:
        return this.ordersService.getRevenuePerDay(startDate, endDate, branch);
      default:
        return [];
    }
  }

  getDashboardDataBranch(phone: string, branchGetDataDto: BranchGetDataDto) {
    // phone of branch manager get dashboard data of own branch
    console.log("branchGetDataDto", branchGetDataDto);
    return [];
  }
}
