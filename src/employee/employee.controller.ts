import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  Query,
  ParseEnumPipe,
} from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { Role } from "~/shared";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { CreateManagerDto } from "./dto/create-manager.dto";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Controller("employee")
@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(Role.Admin)
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.employeeService.createEmployee(createEmployeeDto);
  }

  @Post("create-manager")
  @Roles(Role.Admin)
  async createManager(@Body() createManagerDto: CreateManagerDto) {
    return await this.employeeService.createManager(createManagerDto);
  }

  @Get(":id")
  @Roles(Role.Admin)
  async getOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.employeeService.getOne(id);
  }

  @Get()
  @Roles(Role.Admin)
  async getAll(@Query("role", new ParseEnumPipe(Role)) role: Role) {
    return await this.employeeService.getAll(role);
  }

  @Patch("update-manager")
  @Roles(Role.Admin)
  async update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return await this.employeeService.update(id, updateEmployeeDto);
  }
}
