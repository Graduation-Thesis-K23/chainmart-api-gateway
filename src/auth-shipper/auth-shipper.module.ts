import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { EmployeeModule } from "../employee/employee.module";
import { ShipperJwtStrategy } from "./strategies/jwt.strategy";
import { AuthShipperService } from "./auth-shipper.service";
import { AuthShipperController } from "./auth-shipper.controller";
import { BranchModule } from "../branch/branch.module";

@Module({
  imports: [JwtModule.register({}), EmployeeModule, BranchModule],
  controllers: [AuthShipperController],
  providers: [AuthShipperService, ShipperJwtStrategy],
})
export class AuthShipperModule {}
