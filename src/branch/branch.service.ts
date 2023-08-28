import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { Branch } from "./entities/branch.entity";

@Injectable()
export class BranchService {
  constructor(@InjectRepository(Branch) private readonly branchRepository: Repository<Branch>) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    return await this.branchRepository.save(createBranchDto);
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.createQueryBuilder("branch").take(30).getMany();
  }

  async findOne(id: string): Promise<Branch> {
    try {
      return this.branchRepository.findOne({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Cannot find branch with id(${id})`);
    }
  }

  async disable(id: string) {
    try {
      const branch = await this.branchRepository.findOne({
        where: {
          id,
        },
      });
      branch.active = false;
      return await this.branchRepository.save(branch);
    } catch (error) {
      throw new BadRequestException(`Cannot find branch with id(${id})`);
    }
  }

  async enable(id: string) {
    try {
      const branch = await this.branchRepository.findOne({
        where: {
          id,
        },
      });
      branch.active = true;
      return await this.branchRepository.save(branch);
    } catch (error) {
      throw new BadRequestException(`Cannot find branch with id(${id})`);
    }
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.branchRepository.findOne({ where: { id } });

    if (!branch) {
      throw new NotFoundException(`branch with ID ${id} not found`);
    }

    const newBranch = {
      ...branch,
      ...updateBranchDto,
    };

    try {
      return await this.branchRepository.save(newBranch);
    } catch (error) {
      throw new BadRequestException(error.code);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.branchRepository.softDelete(id);

      if (result.affected === 0) {
        throw new BadRequestException(`branch with id(${id}) not found`);
      }

      return `branch with id(${id}) have been deleted`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot delete branch with id(${id})`);
    }
  }
}
