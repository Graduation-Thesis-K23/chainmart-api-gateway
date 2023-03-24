import { Repository } from "typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { UpdateSupplierDto } from "./dto/update-supplier.dto";
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

  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    const newSupplier = {
      ...supplier,
      ...updateSupplierDto,
    };

    return await this.supplierRepository.save(newSupplier);
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
