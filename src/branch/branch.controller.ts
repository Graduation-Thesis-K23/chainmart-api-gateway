import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from "@nestjs/common";

import { BranchService } from "./branch.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Public } from "src/auth/decorators/public.decorator";

@Controller("branch")
@UseGuards(JwtAuthGuard, RolesGuard)
@Public()
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    return await this.branchService.create(createBranchDto);
  }

  @Get()
  async findAll() {
    return await this.branchService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.branchService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(":id")
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.branchService.remove(id);
  }
}
