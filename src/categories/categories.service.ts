import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { Category } from "./entities/category.entity";

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly categoriesRepository: Repository<Category>) {}

  async getAll(): Promise<Category[]> {
    return await this.categoriesRepository.find();
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return await this.categoriesRepository.save(createCategoryDto);
  }

  async delete(id: string): Promise<string> {
    const result = await this.categoriesRepository.softDelete(id);

    if (result.affected === 0) {
      throw new BadRequestException(`Category with id(${id}) not found`);
    }

    if (result.affected === 1) {
      return "A category has been deleted";
    }
    return `${result.affected} category have been deleted`;
  }
}
