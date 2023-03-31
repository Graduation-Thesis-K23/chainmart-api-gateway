import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { CategoriesService } from "./categories.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAll() {
    return await this.categoriesService.getAll();
  }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Delete(":id")
  async delete(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.categoriesService.delete(id);
  }
}
