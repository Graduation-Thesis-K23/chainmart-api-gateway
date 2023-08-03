import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { EmployeePayload } from "../../shared";

@Injectable()
export class ShipperJwtStrategy extends PassportStrategy(Strategy, "jwt-shipper") {
  constructor(private readonly configService: ConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_EMPLOYEE_SECRET"),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
