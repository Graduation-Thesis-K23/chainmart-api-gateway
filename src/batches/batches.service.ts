import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import * as moment from "moment";

import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Batch } from "./entities/batch.entity";
import { User } from "~/users/entities/user.entity";
import { Employee } from "~/employee/entities/employee.entity";
import { Product } from "~/products/entities/product.entity";

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createBatchDto: CreateBatchDto): Promise<Batch> {
    const product = await this.productRepository.findOneBy({ id: createBatchDto.product_id });
    if (!product) {
      throw new BadRequestException("Product not found");
    }

    const { product_code } = product;
    const batch_code = product_code + "_" + moment().format("YYYY_MM_DD");

    try {
      const batch = this.batchRepository.create({ ...createBatchDto, batch_code });
      return this.batchRepository.save(batch);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot create batch");
    }
  }

  async findAll(): Promise<Batch[]> {
    try {
      return this.batchRepository.find({
        relations: {
          product: true,
          branch: true,
          employee_create: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException("Cannot find batches");
    }
  }

  async findOne(id: string): Promise<Batch> {
    try {
      return this.batchRepository.findOne({
        relations: {
          product: true,
          branch: true,
          employee_create: true,
        },
        where: {
          id,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot find batch with id(${id})`);
    }
  }

  async update(id: string, updateBatchDto: UpdateBatchDto): Promise<any> {
    return `This action updates a #${id} batch`;
  }

  async remove(id: string): Promise<string> {
    try {
      const result = await this.batchRepository.softDelete(id);

      if (result.affected === 0) {
        throw new BadRequestException(`Batch with id(${id}) not found`);
      }

      return `Batch with id(${id}) have been deleted`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot delete batch with id(${id})`);
    }
  }
}
