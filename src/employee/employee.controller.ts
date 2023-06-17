import { Body, Controller, Post } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";

@Controller("employee")
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(createEmployeeDto);
  }
}
