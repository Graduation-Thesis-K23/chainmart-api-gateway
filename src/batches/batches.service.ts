import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom, lastValueFrom, timeout } from "rxjs";

import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";

interface CreateBatchHasEmployeeDto extends CreateBatchDto {
  employee_create_id: string;
}

@Injectable()
export class BatchesService {
  constructor(
    @Inject("BATCH_SERVICE")
    private readonly batchClient: ClientKafka,
  ) {}

  async create(createBatchDto: CreateBatchHasEmployeeDto) {
    try {
      const $source = this.batchClient.send("batches.create", { ...createBatchDto }).pipe(timeout(5000));

      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    try {
      const $source = this.batchClient.send("batches.findall", {}).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAllByProductId(productId: string) {
    try {
      const $source = this.batchClient.send("batches.findallbyproductid", productId).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find batches by product_id");
    }
  }

  async findById(id: string) {
    try {
      const $source = this.batchClient.send("batches.findbyid", id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot find batch with id(${id})`);
    }
  }

  async update(id: string, updateBatchDto: UpdateBatchDto) {
    return `This action updates a #${id} batch`;
  }

  async delete(id: string) {
    try {
      const $source = this.batchClient.send("batches.delete", id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }
}
