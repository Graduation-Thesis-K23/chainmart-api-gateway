import { Controller, Get, Post, Body } from "@nestjs/common";
import { SubscribersService } from "./subscribers.service";
import { CreateSubscriberDto } from "./dto/create-subscriber.dto";

@Controller("subscribers")
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  create(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.subscribersService.create(createSubscriberDto.email);
  }

  @Get()
  findAll() {
    return this.subscribersService.findAll();
  }
}
