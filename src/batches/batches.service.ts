import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom, lastValueFrom, timeout } from "rxjs";

import { CreateBatchDto } from "./dto/create-batch.dto";
import { EmployeeService } from "~/employee/employee.service";

/* interface CreateBatchHasEmployeeDto extends CreateBatchDto {
  employee_create_id: string;
}
 */
@Injectable()
export class BatchesService {
  constructor(
    @Inject("BATCH_SERVICE")
    private readonly batchClient: ClientKafka,

    private readonly employeeService: EmployeeService,
  ) {}

  async create(employee_create_phone: string, createBatchDto: CreateBatchDto) {
    const { id: branch_id } = await this.employeeService.findBranchByPhone(employee_create_phone);

    try {
      const payload = { ...createBatchDto, employee_create_phone, branch_id };

      const $source = this.batchClient.send("batches.create", payload).pipe(timeout(5000));

      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(phone: string) {
    const { id: branch_id } = await this.employeeService.findBranchByPhone(phone);

    try {
      const $source = this.batchClient.send("batches.findall", branch_id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getAvailable(phone: string, getAvailableDto: string[]) {
    const { id: branch_id } = await this.employeeService.findBranchByPhone(phone);

    const rawData = getAvailableDto.map((product_id) => ({ product_id, branch_id }));

    try {
      const $source = this.batchClient.send("batches.getavailablequantity", rawData).pipe(timeout(5000));
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

  /*   async update(id: string, updateBatchDto: UpdateBatchDto) {
    return `This action updates a #${id} batch`;
  } */

  async delete(id: string) {
    try {
      const $source = this.batchClient.send("batches.delete", id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getRemainingQuantity(id: string) {
    try {
      const $source = this.batchClient.send("batches.get_remaining_quantity", id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSoldByIds(ids: string[]) {
    try {
      const $sold = this.batchClient.send("batches.get-sold-by-ids", { ids }).pipe(timeout(5000));

      return await lastValueFrom($sold);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }
}
