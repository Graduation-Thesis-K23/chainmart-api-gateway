import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EmployeeService } from "./employee.service";
import { EmployeeController } from "./employee.controller";
import { Employee } from "./entities/employee.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
