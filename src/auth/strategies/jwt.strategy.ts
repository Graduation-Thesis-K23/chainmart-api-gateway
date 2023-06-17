import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

import { UserPayload } from "../../shared";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request.cookies["access_token"];

          return data ? data : null;
        },
      ]),
    });
  }

  async validate(payload: UserPayload): Promise<UserPayload> {
    if (payload === null) {
      throw new UnauthorizedException();
    }

    const { username, name, role, photo } = payload;

    return {
      username,
      name,
      role,
      photo,
    };
  }
}
