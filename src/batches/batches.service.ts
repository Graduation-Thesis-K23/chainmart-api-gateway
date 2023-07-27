import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import * as moment from "moment";

import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Batch } from "./entities/batch.entity";
import { ProductsService } from "~/products/products.service";

interface CreateBatchDto1 extends CreateBatchDto {
  employee_create_id: string;
}

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    private readonly productService: ProductsService,
  ) {}

  async create(createBatchDto: CreateBatchDto1): Promise<Batch> {
    const product = await this.productService.findById(createBatchDto.product_id);
    if (!product) {
      throw new BadRequestException("Product not found");
    }

    const { product_code } = product;
    const batch_code = product_code + "-" + moment().format("YYYY_MM_DD") + "-" + Date.now();

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
          branch: true,
          employee_create: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find batches");
    }
  }

  async findAllByProductId(productId: string): Promise<Batch[]> {
    const product = await this.productService.findById(productId);
    if (!product) {
      throw new BadRequestException("Product not found");
    }

    try {
      return this.batchRepository.find({
        relations: {
          branch: true,
          employee_create: true,
        },
        where: {
          product_id: productId,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find batches by product_id");
    }
  }

  async findOne(id: string): Promise<Batch> {
    try {
      return this.batchRepository.findOne({
        relations: {
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
