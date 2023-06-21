import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { S3Service } from "~/s3/s3.service";
import { Employee } from "./entities/employee.entity";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { CreateManagerDto } from "./dto/create-manager.dto";
import { Role } from "~/shared";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { Branch } from "~/branch/entities/branch.entity";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly s3Service: S3Service,
  ) {}

  async findOneByPhone(phone: string) {
    return await this.employeeRepository.findOneBy({ phone });
  }

  async createEmployee(phone: string, createEmployeeDto: CreateEmployeeDto) {
    // check employee exist
    const employeeExist = await this.findOneByPhone(createEmployeeDto.phone);

    if (employeeExist) {
      throw new BadRequestException(`Employee with ${phone} phone number already exist`);
    }

    const branch: Branch = await this.getBranchIdByEmployeePhone(phone);

    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      password: "Chainmart123@@",
      role: Role.Employee,
      branchId: branch.id,
    });

    return await this.employeeRepository.save(employee);
  }

  async createManager(createManagerDto: CreateManagerDto) {
    const newManager = this.employeeRepository.create({
      ...createManagerDto,
      password: "Chainmart123@@",
      role: Role.Manager,
    });

    return await this.employeeRepository.save(newManager);
  }

  async disableEmployee(phone: string, id: string) {
    const branch: Branch = await this.getBranchIdByEmployeePhone(phone);

    const employee = await this.employeeRepository.findOneBy({ id, branchId: branch.id });

    if (!employee) {
      throw new BadRequestException(`Employee with branch ${branch.id} and id ${id} not exist`);
    }

    employee.isActive = false;

    return await this.employeeRepository.save(employee);
  }

  async resetPasswordEmployee(phone: string, id: string) {
    const branch: Branch = await this.getBranchIdByEmployeePhone(phone);

    const employee = await this.employeeRepository.findOneBy({ id, branchId: branch.id });

    if (!employee) {
      throw new BadRequestException(`Employee with branch ${branch.id} and id ${id} not exist`);
    }

    employee.password = "Chainmart123@@"; // default password

    return await this.employeeRepository.save(employee);
  }

  async getBranchIdByEmployeePhone(phone: string): Promise<Branch> {
    const employee = await this.employeeRepository.findOneBy({ phone });

    if (!employee) {
      throw new BadRequestException("Employee not exist");
    }

    return employee.branchId as unknown as Branch;
  }

  async getOne(id: string) {
    const employee = await this.employeeRepository.findOneBy({ id });

    if (!employee) {
      throw new BadRequestException("Employee not exist");
    }

    return employee;
  }

  async getAll(role: Role) {
    /* 
      role = ADMIN select all role
    */
    if (role === Role.Admin) {
      return await this.employeeRepository.find({
        take: 15,
        select: ["role", "id", "created_at", "name", "phone", "branchId"],
      });
    } else {
      return await this.employeeRepository.find({
        take: 15,
        where: {
          role,
        },
        select: ["role", "id", "created_at", "name", "phone", "branchId"],
      });
    }
  }

  async getAllEmployee(phone: string) {
    const branch: Branch = await this.getBranchIdByEmployeePhone(phone);

    return await this.employeeRepository.find({
      take: 15,
      where: {
        branchId: branch.id,
        role: Role.Employee,
      },
      select: ["role", "id", "created_at", "name", "phone", "branchId"],
      relations: ["branchId"],
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employeeExist = await this.getOne(id);

    if (!employeeExist) {
      throw new BadRequestException("Employee not exist");
    }

    const newEmployee = {
      ...employeeExist,
      ...updateEmployeeDto,
    };

    return await this.employeeRepository.save(newEmployee);
  }
}
