import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "SEARCH_SERVICE",
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: "search",
              brokers: configService.get("KAFKA_BROKERS").split(","),
            },
            consumer: {
              groupId: "search-consumer",
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
