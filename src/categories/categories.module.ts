import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

import { CategoriesController } from "./categories.controller";
import { Category } from "./entities/category.entity";
import { CategoriesService } from "./categories.service";

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
