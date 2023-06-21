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
  Req,
  BadRequestException,
} from "@nestjs/common";
import { Request } from "express";

import { EmployeeService } from "./employee.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { EmployeePayload, Role } from "~/shared";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { CreateManagerDto } from "./dto/create-manager.dto";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Controller("employee")
@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post("create-employee")
  @Roles(Role.Manager)
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req: Request) {
    const { phone } = req.user as EmployeePayload;
    return await this.employeeService.createEmployee(phone, createEmployeeDto);
  }

  @Get("disable-employee/:id")
  @Roles(Role.Manager)
  async disableEmployee(@Req() req: Request, @Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    const { phone } = req.user as EmployeePayload;
    return await this.employeeService.disableEmployee(phone, id);
  }

  // reset password employee use by manager
  @Get("reset-password-manager/:id")
  @Roles(Role.Manager)
  async resetPasswordEmployee(@Req() req: Request, @Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    const { phone } = req.user as EmployeePayload;
    return await this.employeeService.resetPasswordEmployee(phone, id);
  }

  @Post("create-manager")
  @Roles(Role.Admin)
  async createManager(@Body() createManagerDto: CreateManagerDto) {
    try {
      return await this.employeeService.createManager(createManagerDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get("manager")
  @Roles(Role.Manager)
  async getAllEmployee(@Req() req: Request) {
    const { phone } = req.user as EmployeePayload;

    return await this.employeeService.getAllEmployee(phone);
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

  @Patch(":id/update-manager")
  @Roles(Role.Admin)
  async update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return await this.employeeService.update(id, updateEmployeeDto);
  }
}
