import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

import { EmployeeService } from "./employee.service";
import { EmployeeController } from "./employee.controller";
import { Employee } from "./entities/employee.entity";
import { S3Module } from "~/s3/s3.module";
import { BranchModule } from "~/branch/branch.module";
import { ErrorsModule } from "~/errors/errors.module";

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), S3Module, BranchModule, ErrorsModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
