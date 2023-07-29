import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { Comment } from "./entities/comment.entity";
import { UsersModule } from "~/users/users.module";
import { ProductsModule } from "~/products/products.module";

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), UsersModule, ProductsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
