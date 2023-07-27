import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { EmployeeModule } from "../employee/employee.module";
import { ShipperJwtStrategy } from "./strategies/jwt.strategy";
import { AuthShipperService } from "./auth-shipper.service";
import { AuthShipperController } from "./auth-shipper.controller";

@Module({
  imports: [JwtModule.register({}), EmployeeModule],
  controllers: [AuthShipperController],
  providers: [AuthShipperService, ShipperJwtStrategy],
})
export class AuthShipperModule {}
