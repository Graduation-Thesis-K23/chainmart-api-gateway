import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

import { EmployeeService } from "./employee.service";
import { EmployeeController } from "./employee.controller";
import { Employee } from "./entities/employee.entity";
import { S3Module } from "~/s3/s3.module";

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), S3Module],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
