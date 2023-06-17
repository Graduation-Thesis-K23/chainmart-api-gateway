import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Address } from "./entities/address.entity";
import { CreateAddressDto } from "./dto/create-address.dto";

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(username: string, createAddressDto: CreateAddressDto) {
    const newAddress = {
      ...createAddressDto,
      user: username,
    };

    return await this.addressRepository.save(newAddress);
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
