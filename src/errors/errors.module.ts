import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ErrorsService } from "./errors.service";
import { ErrorEntity } from "./entities/error.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ErrorEntity])],
  providers: [ErrorsService],
  exports: [ErrorsService],
})
export class ErrorsModule {}
