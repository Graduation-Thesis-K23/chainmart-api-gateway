import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { BranchService } from "./branch.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { Branch } from "./entities/branch.entity";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { Role } from "~/shared";

@Controller("branch")
@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  async create(@Body() createBranchDto: CreateBranchDto): Promise<Branch> {
    return await this.branchService.create(createBranchDto);
  }

  @Get()
  async findAll(): Promise<Branch[]> {
    return await this.branchService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string): Promise<Branch> {
    return await this.branchService.findOne(id);
  }

  @Get(":id/disable")
  async disable(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string): Promise<Branch> {
    return await this.branchService.disable(id);
  }

  @Get(":id/enable")
  async enable(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string): Promise<Branch> {
    return await this.branchService.enable(id);
  }

  @Patch(":id")
  async update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return await this.branchService.update(id, updateBranchDto);
  }

  @Delete(":id")
  async remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.branchService.remove(id);
  }
}
