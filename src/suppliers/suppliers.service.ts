import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Supplier } from "./entities/supplier.entity";
import { CreateSupplierDto } from "./dto/create-supplier.dto";

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Supplier) private readonly supplierRepository: Repository<Supplier>) {}

  async getAll(): Promise<Supplier[]> {
    return await this.supplierRepository.find();
  }

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return await this.supplierRepository.save(createSupplierDto);
  }

  async delete(id: string) {
    const result = await this.supplierRepository.softDelete(id);

    if (result.affected === 0) {
      throw new BadRequestException(`Supplier with id(${id}) not found`);
    }

    if (result.affected === 1) {
      return "A supplier has been deleted";
    }
    return `${result.affected} supplier have been deleted`;
  }
}
