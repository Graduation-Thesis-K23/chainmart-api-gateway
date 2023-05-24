import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";

import { SubscriberService } from "./subscriber.service";
import { CreateSubscriberDto } from "./dto/create-subscriber.dto";

@Controller("subscriber")
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @Post()
  create(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.subscriberService.create(createSubscriberDto);
  }
}
