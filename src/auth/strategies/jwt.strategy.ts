import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request.cookies["access_token"];

          return data ? data : null;
        },
      ]),
    });
  }

  async validate(payload: any): Promise<any> {
    if (payload === null) {
      throw new UnauthorizedException();
    }

    const { username, email, name, role } = payload;

    return {
      username,
      email,
      name,
      role,
    };
  }
}
