import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { CategoriesService } from "./categories.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth-manager/guards/role.guard";
import { Roles } from "../auth-manager/decorators/roles.decorator";
import { Role } from "src/shared";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.Employee)
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
