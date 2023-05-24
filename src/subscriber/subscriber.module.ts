import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SubscriberService } from "./subscriber.service";
import { SubscriberController } from "./subscriber.controller";
import { Subscriber } from "./entities/subscriber.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  controllers: [SubscriberController],
  providers: [SubscriberService],
})
export class SubscriberModule {}
