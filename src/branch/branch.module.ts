import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BranchService } from "./branch.service";
import { BranchController } from "./branch.controller";
import { Branch } from "./entities/branch.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchController],
  providers: [BranchService],
})
export class BranchModule {}
