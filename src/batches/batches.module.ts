import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { BatchesService } from "./batches.service";
import { BatchesController } from "./batches.controller";
import { EmployeeModule } from "~/employee/employee.module";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "BATCH_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "batch",
                brokers: configService.get("KAFKA_BROKERS").split(","),
              },
              consumer: {
                groupId: "batch-consumer",
              },
            },
          };
        },
      },
    ]),
    EmployeeModule,
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
