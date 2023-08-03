import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Address } from "./entities/address.entity";
import { CreateAddressDto } from "./dto/create-address.dto";
import { ClientKafka } from "@nestjs/microservices";

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @Inject("ORDER_SERVICE")
    private readonly orderClient: ClientKafka,
  ) {}

  async create(username: string, createAddressDto: CreateAddressDto) {
    const newAddress = {
      ...createAddressDto,
      user: username,
    };

    const result = await this.addressRepository.save(newAddress);

    const { id, phone, name, district, city, ward, street } = result;

    this.orderClient.emit("orders.address.created", {
      id,
      phone,
      name,
      district,
      city,
      ward,
      street,
    });

    return result;
  }

  async findById(id: string) {
    try {
      return this.addressRepository.findOneBy({ id });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot found address with id(${id})`);
    }
  }

  async getAll(user: string) {
    return await this.addressRepository.createQueryBuilder().where({ user }).getMany();
  }

  async delete(user: string, id: string) {
    const address = await this.addressRepository.createQueryBuilder().where({ user, id }).getOne();

    if (!address) {
      throw new BadRequestException("setting.deleteAddressFail");
    }
    const result = await this.addressRepository.softDelete(id);

    if (result.affected > 0) {
      return {
        messageCode: "setting.deleteAddressSuccess",
      };
    }
  }
}
