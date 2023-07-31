import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { UsersModule } from "~/users/users.module";
import { OrdersModule } from "~/orders/orders.module";

@Module({
  imports: [OrdersModule, UsersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
