import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { SignInDto } from "./dto/sign-in.dto";
import { EmployeePayload } from "~/shared";
import { EmployeeService } from "./../employee/employee.service";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class AuthShipperService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly employeeService: EmployeeService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<[string, EmployeePayload]> {
    const { phone, password } = signInDto;

    const employeeFound = await this.employeeService.findOneByPhone(phone);
    if (!employeeFound) {
      throw new UnauthorizedException("Account not exist");
    }

    if (employeeFound.role !== "SHIPPER") {
      throw new UnauthorizedException("Account not correct");
    }

    const isMatch = await bcrypt.compare(password, employeeFound.password);
    if (!isMatch) {
      throw new UnauthorizedException("Account not correct");
    }

    const payload: EmployeePayload = {
      phone: employeeFound.phone,
      name: employeeFound.name,
      role: employeeFound.role,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload];
  }

  async changePassword(phone: string, changePasswordDto: ChangePasswordDto): Promise<EmployeePayload> {
    const employee = await this.employeeService.findOneByPhone(phone);

    if (!employee) {
      throw new UnauthorizedException("Account not exist");
    }

    const isMatch = await bcrypt.compare(changePasswordDto.password, employee.password);
    if (!isMatch) {
      throw new UnauthorizedException("Old password not correct");
    }

    employee.password = changePasswordDto.newPassword;

    await this.employeeService.save(employee);

    return {
      phone: employee.phone,
      name: employee.name,
      role: employee.role,
    };
  }

  private async signToken(payload: any): Promise<string> {
    const options = {
      secret: this.configService.get<string>("JWT_EMPLOYEE_SECRET"),
      issuer: this.configService.get<string>("JWT_ISSUER") || "http://localhost:3000/auth",
      audience: this.configService.get<string>("JWT_AUDIENCE") || "http://localhost:8080",
      expiresIn: "365d",
    };

    return this.jwtService.signAsync(payload, options);
  }
}
