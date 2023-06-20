import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { S3Service } from "~/s3/s3.service";
import { Employee } from "./entities/employee.entity";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { CreateManagerDto } from "./dto/create-manager.dto";
import { Role } from "~/shared";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly s3Service: S3Service,
  ) {}

  async findOneByPhone(phone: string) {
    return this.employeeRepository.findOneBy({ phone });
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const employee = this.employeeRepository.create(createEmployeeDto);

    return this.employeeRepository.save(employee);
  }

  async createManager(createManagerDto: CreateManagerDto) {
    const newManager = this.employeeRepository.create({
      ...createManagerDto,
      password: "Chainmart123@@",
      role: Role.Manager,
    });

    return this.employeeRepository.save(newManager);
  }

  async getOne(id: string) {
    const employee = this.employeeRepository.findOneBy({ id });

    if (!employee) {
      throw new BadRequestException("Employee not exist");
    }

    return employee;
  }

  async getAll(role: Role) {
    if (role === Role.Admin) {
      return await this.employeeRepository.find({
        take: 15,
        select: ["branchId", "role", "id", "created_at", "name", "phone"],
      });
    } else {
      return await this.employeeRepository.find({
        take: 15,
        where: {
          role,
        },
        select: ["branchId", "role", "id", "created_at", "name", "phone"],
      });
    }
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employeeExist = this.getOne(id);

    const newEmployee = {
      ...employeeExist,
      ...updateEmployeeDto,
    };

    return await this.employeeRepository.save(newEmployee);
  }
}
