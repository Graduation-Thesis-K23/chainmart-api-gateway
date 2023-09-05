import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthManagerService } from "./auth-manager.service";
import { AuthManagerController } from "./auth-manager.controller";
import { EmployeeModule } from "../employee/employee.module";
import { EmployeeJwtStrategy } from "./strategies/jwt.strategy";
import { BranchModule } from "~/branch/branch.module";

@Module({
  imports: [JwtModule.register({}), EmployeeModule, BranchModule],
  controllers: [AuthManagerController],
  providers: [AuthManagerService, EmployeeJwtStrategy],
})
export class AuthManagerModule {}
