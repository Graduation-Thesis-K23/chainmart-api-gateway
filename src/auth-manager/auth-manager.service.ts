import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { SignInDto } from "./dto/sign-in.dto";
import { EmployeePayload } from "src/shared";
import { EmployeeService } from "./../employee/employee.service";

@Injectable()
export class AuthManagerService {
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

    const isMatch = await bcrypt.compare(password, employeeFound.password);
    if (!isMatch) {
      throw new UnauthorizedException("Account not correct");
    }

    const payload: EmployeePayload = {
      phone: employeeFound.phone,
      name: employeeFound.name,
      photo: employeeFound.photo,
      role: employeeFound.role,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload];
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
