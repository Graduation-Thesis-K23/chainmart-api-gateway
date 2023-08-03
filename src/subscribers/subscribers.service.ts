import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Subscriber } from "./entities/subscriber.entity";
import { Repository } from "typeorm";

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private subscribersRepository: Repository<Subscriber>,
  ) {}

  async create(email: string) {
    const find = await this.subscribersRepository.findOneBy({ email });

    if (find) {
      throw new BadRequestException("subscriber.already_exists");
    }

    return this.subscribersRepository.save({ email });
  }

  async findAll() {
    return this.subscribersRepository.find();
  }
}
