import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";
import { FacebookStrategy } from "./strategies/facebook.strategy";
import { MailModule } from "../mail/mail.module";
import { PhoneServiceModule } from "../phone-service/phone-service.module";

@Module({
  imports: [JwtModule.register({}), UsersModule, PassportModule, MailModule, PhoneServiceModule],
  controllers: [AuthController],
  providers: [GoogleStrategy, AuthService, JwtStrategy, FacebookStrategy],
})
export class AuthModule {}
