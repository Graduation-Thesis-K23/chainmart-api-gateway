import { BadRequestException, Injectable } from "@nestjs/common";
import { In, Not, Repository } from "typeorm";
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

  async save(obj: unknown) {
    return await this.employeeRepository.save(obj);
  }

  async createEmployee(phone: string, createEmployeeDto: CreateEmployeeDto) {
    if (createEmployeeDto.role === Role.Admin || createEmployeeDto.role === Role.Branch) {
      throw new BadRequestException("You cannot create admin");
    }
    // check employee exist
    const employeeExist = await this.findOneByPhone(createEmployeeDto.phone);

    if (employeeExist) {
      throw new BadRequestException(`Employee with ${createEmployeeDto.phone} phone number already exist`);
    }

    const branch = await this.getBranchIdByEmployeePhone(phone);

    const employee = new Employee({
      ...createEmployeeDto,
      password: "Chainmart123@@",
      branch,
    });

    const { name, id, phone: employeePhone, role, isActive, created_at } = await this.employeeRepository.save(employee);

    return {
      id,
      name,
      phone: employeePhone,
      role,
      created_at,
      branch: {
        id: branch.id,
        name: branch.name,
      },
      isActive,
    };
  }

  async findBranchByPhone(employee_create_phone: string) {
    const employee = await this.employeeRepository.findOne({
      where: {
        phone: employee_create_phone,
      },
      relations: ["branch"],
    });
    return employee.branch;
  }

  async createManager(createManagerDto: CreateManagerDto) {
    // check employee exist
    const employeeExist = await this.findOneByPhone(createManagerDto.phone);

    if (employeeExist) {
      throw new BadRequestException(`Employee with ${createManagerDto.phone} phone number already exist`);
    }

    const branch = await this.branchService.findOne(createManagerDto.branch_id);

    const employee = new Employee({
      ...createManagerDto,
      role: Role.Branch,
      password: "Chainmart123@@",
    });

    const { name, id, phone, role, isActive, created_at } = await this.employeeRepository.save(employee);

    return {
      id,
      name,
      phone,
      role,
      created_at,
      branch: {
        id: branch.id,
        name: branch.name,
      },
      isActive,
    };
  }

  async disableEmployee(phone: string, id: string, active: boolean) {
    const branch = await this.getBranchIdByEmployeePhone(phone);

    const employee = await this.employeeRepository
      .createQueryBuilder("employee")
      .where("employee.phone = :id", { id })
      .andWhere("employee.branch_id = :branch_id", { branch_id: branch.id })
      .getOne();

    if (!employee) {
      throw new BadRequestException(`Employee with branch ${branch.id} and id ${id} not exist`);
    }

    const newEmployee = new Employee({
      ...employee,
      isActive: active,
      role: employee.role,
    });

    await this.employeeRepository.save(newEmployee);

    return {
      id: newEmployee.id,
      name: newEmployee.name,
      phone: newEmployee.phone,
      created_at: newEmployee.created_at,
      isActive: newEmployee.isActive,
      role: newEmployee.role,
    };
  }

  async resetPasswordEmployee(phone: string, id: string) {
    const branch = await this.getBranchIdByEmployeePhone(phone);

    const employee = await this.employeeRepository
      .createQueryBuilder("employee")
      .where("employee.id = :id", { id })
      .andWhere("employee.branch_id = :branch_id", { branch_id: branch.id })
      .getOne();

    if (!employee) {
      throw new BadRequestException(`Employee with branch ${branch.id} and id ${id} not exist`);
    }

    employee.password = "Chainmart123@@"; // default password

    const newPassword = await this.employeeRepository.save(employee);

    return {
      id: newPassword.id,
      name: newPassword.name,
      phone: newPassword.phone,
      role: newPassword.role,
    };
  }

  async resetPassword(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
      },
    });
    if (!employee) {
      throw new BadRequestException(`Employee with id ${id} not exist`);
    }

    employee.password = "Chainmart123@@"; // default password

    const newPassword = await this.employeeRepository.save(employee);

    return {
      id: newPassword.id,
      name: newPassword.name,
      phone: newPassword.phone,
      role: newPassword.role,
      branch: newPassword.branch,
    };
  }

  async getBranchIdByEmployeePhone(phone: string): Promise<Branch> {
    const employee = await this.employeeRepository.findOne({
      where: {
        phone,
      },
      relations: ["branch"],
    });

    if (!employee) {
      throw new BadRequestException("Employee not exist");
    }

    return employee.branch;
  }

  async getOne(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
      },
      relations: ["branch"],
    });

    if (!employee) {
      throw new BadRequestException(`Employee with id ${id} not exist`);
    }

    return employee;
  }

  async getAll(role: Role) {
    /* 
      role = ADMIN select all role
    */
    if (role === Role.Admin) {
      return await this.employeeRepository.find({
        where: {
          role: Not(Role.Admin),
        },
        select: ["id", "name", "phone", "created_at", "isActive", "role", "branch_id"],
        relations: ["branch"],
      });
    } else {
      return await this.employeeRepository.find({
        where: {
          role,
        },
        //not select password
        select: ["id", "name", "phone", "created_at", "isActive", "role", "branch_id"],
        relations: ["branch"],
      });
    }
  }

  async getAllEmployee(phone: string) {
    const branch = await this.getBranchIdByEmployeePhone(phone);

    return await this.employeeRepository.find({
      where: {
        branch_id: branch.id,
        role: In([Role.Employee, Role.Shipper]),
      },
      relations: ["branch"],
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    console.log(id);
    const employeeExist = await this.getOne(id);
    const branch = await this.branchService.findOne(updateEmployeeDto.branch_id);

    if (!employeeExist) {
      throw new BadRequestException("Employee not exist");
    }

    const newEmployee = this.employeeRepository.create({
      ...employeeExist,
      ...updateEmployeeDto,
      branch,
      branch_id: branch.id,
    });

    return await this.employeeRepository.save(newEmployee);
  }
}
