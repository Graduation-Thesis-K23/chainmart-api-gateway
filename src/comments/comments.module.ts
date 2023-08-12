import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { Comment } from "./entities/comment.entity";
import { UsersModule } from "~/users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: "RATE_SERVICE",
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: "rates-service",
              brokers: configService.get("KAFKA_BROKERS").split(","),
            },
            consumer: {
              groupId: "rates-consumer-1",
            },
          },
        }),
      },
    ]),
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
/*  */
