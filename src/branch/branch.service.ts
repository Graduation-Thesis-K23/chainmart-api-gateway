import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { Branch } from "./entities/branch.entity";

@Injectable()
export class BranchService {
  constructor(@InjectRepository(Branch) private readonly branchRepository: Repository<Branch>) {}

  async create(createBranchDto: CreateBranchDto) {
    try {
      return this.branchRepository.save(createBranchDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    try {
      return await this.branchRepository.find();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.branchRepository.findOneBy({
        id,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.findOne(id);

    if (!branch) {
      throw new BadRequestException(`branch ${id} not exist`);
    }

    const newBranch = {
      ...branch,
      ...updateBranchDto,
    };
    try {
      return await this.branchRepository.save(newBranch);
    } catch (error) {
      throw new BadRequestException(`delete branch ${id} failed`);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.branchRepository.softDelete(id);

      if (result.affected === 1) {
        return "success";
      }

      throw new BadRequestException(`branch ${id} not found`);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
