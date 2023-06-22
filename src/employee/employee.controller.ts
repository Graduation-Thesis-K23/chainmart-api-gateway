import { ErrorsService } from "./../errors/errors.service";
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
  constructor(private readonly employeeService: EmployeeService, private readonly errorsService: ErrorsService) {}

  @Post("create-employee")
  @Roles(Role.Manager)
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req: Request) {
    try {
      const { phone } = req.user as EmployeePayload;
      return await this.employeeService.createEmployee(phone, createEmployeeDto);
    } catch (error) {
      await this.errorsService.save(error.response);
    }
  }

  @Get("active-employee/:id")
  @Roles(Role.Manager)
  async disableEmployee(@Req() req: Request, @Param("id") id: string, @Query("active") active: boolean) {
    try {
      const { phone } = req.user as EmployeePayload;

      return await this.employeeService.disableEmployee(phone, id, active);
    } catch (error) {
      console.log(error);
      await this.errorsService.save(error.response);
    }
  }

  // reset password employee use by manager
  @Get("reset-password-manager/:id")
  @Roles(Role.Manager)
  async resetPasswordEmployee(@Req() req: Request, @Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    try {
      const { phone } = req.user as EmployeePayload;
      return await this.employeeService.resetPasswordEmployee(phone, id);
    } catch (error) {
      await this.errorsService.save(error.response);
    }
  }

  @Post("create-manager")
  @Roles(Role.Admin)
  async createManager(@Body() createManagerDto: CreateManagerDto) {
    try {
      return await this.employeeService.createManager(createManagerDto);
    } catch (error) {
      await this.errorsService.save(error.response);
    }
  }

  @Get("manager")
  @Roles(Role.Manager)
  async getAllEmployee(@Req() req: Request) {
    try {
      const { phone } = req.user as EmployeePayload;
      return await this.employeeService.getAllEmployee(phone);
    } catch (error) {
      await this.errorsService.save(error.response);
    }
  }

  @Get(":id")
  @Roles(Role.Admin)
  async getOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    try {
      return await this.employeeService.getOne(id);
    } catch (error) {
      await this.errorsService.save(error.response);
    }
  }

  @Get()
  @Roles(Role.Admin)
  async getAll(@Query("role", new ParseEnumPipe(Role)) role: Role) {
    try {
      return await this.employeeService.getAll(role);
    } catch (error) {
      await this.errorsService.save(error.response);
    }
  }

  @Patch(":id/update-manager")
  @Roles(Role.Admin)
  async update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    try {
      return await this.employeeService.update(id, updateEmployeeDto);
    } catch (error) {
      await this.errorsService.save(error.response);
    }
  }
}
