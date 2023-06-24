import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

import { EmployeePayload } from "../../shared";

@Injectable()
export class EmployeeJwtStrategy extends PassportStrategy(Strategy, "jwt-employee") {
  constructor(private readonly configService: ConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_EMPLOYEE_SECRET"),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request.cookies["access_token_manager"];

          return data ? data : null;
        },
      ]),
    });
  }

  async validate(payload: EmployeePayload): Promise<EmployeePayload> {
    if (payload === null) {
      throw new UnauthorizedException();
    }

    const { phone, name, role } = payload;

    return {
      phone,
      name,
      role,
    };
  }
}
