import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { Employee } from "./entities/employee.entity";
import { log } from "console";

@Injectable()
export class EmployeeService {
  constructor(@InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const employee = this.employeeRepository.create(createEmployeeDto);
      return await this.employeeRepository.save(employee);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    try {
      return await this.employeeRepository.find();
    } catch (error) {
      throw new BadRequestException("");
    }
  }

  async findOne(id: string) {
    try {
      return await this.employeeRepository.findOneBy({ id });
    } catch (error) {
      throw new BadRequestException("");
    }
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    if (!employee) {
      throw new BadRequestException(`branch ${id} not exist`);
    }

    const newEmployee = {
      ...employee,
      ...updateEmployeeDto,
    };

    try {
      return await this.employeeRepository.save(newEmployee);
    } catch (error) {
      throw new BadRequestException(`update branch ${id} failed`);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.employeeRepository.softDelete(id);

      if (result.affected === 1) {
        return "success";
      }

      throw new BadRequestException(`branch ${id} not found`);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
