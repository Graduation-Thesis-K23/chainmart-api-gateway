import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { S3Service } from "~/s3/s3.service";
import { Employee } from "./entities/employee.entity";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { CreateManagerDto } from "./dto/create-manager.dto";
import { BranchService } from "./../branch/branch.service";
import { Role } from "~/shared";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { Branch } from "~/branch/entities/branch.entity";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly branchService: BranchService,
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

    const employee = new Employee({
      ...createEmployeeDto,
      password: "Chainmart123@@",
      role: Role.Employee,
      branchId: branch,
    });

    const { name, id, phone: employeePhone, role, isActive, created_at } = await this.employeeRepository.save(employee);

    return {
      id,
      name,
      phone: employeePhone,
      role,
      created_at,
      branchId: {
        id: branch.id,
        name: branch.name,
      },
      isActive,
    };
  }

  async createManager(createManagerDto: CreateManagerDto) {
    // check employee exist
    const employeeExist = await this.findOneByPhone(createManagerDto.phone);

    if (employeeExist) {
      throw new BadRequestException(`Employee with ${createManagerDto.phone} phone number already exist`);
    }

    const branch = await this.branchService.findOne(createManagerDto.branchId);

    const employee = new Employee({
      ...createManagerDto,
      role: Role.Manager,
      password: "Chainmart123@@",
      branchId: branch,
    });

    const { name, id, phone, role, isActive, created_at } = await this.employeeRepository.save(employee);

    return {
      id,
      name,
      phone,
      role,
      created_at,
      branchId: {
        id: branch.id,
        name: branch.name,
      },
      isActive,
    };
  }

  async disableEmployee(phone: string, id: string) {
    const branch: Branch = await this.getBranchIdByEmployeePhone(phone);

    const employee = await this.employeeRepository.findOneBy({ id, branchId: branch });

    if (!employee) {
      throw new BadRequestException(`Employee with branch ${branch.id} and id ${id} not exist`);
    }

    employee.isActive = false;

    return await this.employeeRepository.save(employee);
  }

  async resetPasswordEmployee(phone: string, id: string) {
    const branch: Branch = await this.getBranchIdByEmployeePhone(phone);

    const employee = await this.employeeRepository.findOneBy({ id, branchId: branch });

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
    const employee = await this.employeeRepository
      .createQueryBuilder("employee")
      .where("employee.id = :id", { id })
      .select([
        "employee.id",
        "employee.name",
        "employee.phone",
        "employee.created_at",
        "employee.isActive",
        "employee.role",
        "branch.name",
        "branch.id",
      ])
      .leftJoin("employee.branchId", "branch")
      .getOne();

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
      return await this.employeeRepository
        .createQueryBuilder("employee")
        .select([
          "employee.id",
          "employee.name",
          "employee.phone",
          "employee.created_at",
          "employee.isActive",
          "employee.role",
          "branch.name",
          "branch.id",
        ])
        .leftJoin("employee.branchId", "branch")
        .take(15)
        .getMany();
    } else {
      return await this.employeeRepository
        .createQueryBuilder("employee")
        .where("employee.role = :role", { role })
        .select([
          "employee.id",
          "employee.name",
          "employee.phone",
          "employee.created_at",
          "employee.isActive",
          "employee.role",
          "branch.name",
          "branch.id",
        ])
        .leftJoin("employee.branchId", "branch")
        .take(15)
        .getMany();
    }
  }

  async getAllEmployee(phone: string) {
    const branch: Branch = await this.getBranchIdByEmployeePhone(phone);

    return await this.employeeRepository
      .createQueryBuilder("employee")
      .where("employee.branchId = :branchId", { branchId: branch.id })
      .select([
        "employee.id",
        "employee.name",
        "employee.phone",
        "employee.created_at",
        "employee.isActive",
        "employee.role",
        "branch.name",
        "branch.id",
      ])
      .leftJoin("employee.branchId", "branch")
      .take(15)
      .getMany();
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
