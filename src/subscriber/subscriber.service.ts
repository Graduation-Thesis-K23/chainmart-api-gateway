import { BadRequestException, Injectable } from "@nestjs/common";

import { CreateSubscriberDto } from "./dto/create-subscriber.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Subscriber } from "./entities/subscriber.entity";
import { Repository } from "typeorm";

@Injectable()
export class SubscriberService {
  constructor(@InjectRepository(Subscriber) private readonly subscriberRepository: Repository<Subscriber>) {}

  async create(createSubscriberDto: CreateSubscriberDto) {
    try {
      return await this.subscriberRepository.save(createSubscriberDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
