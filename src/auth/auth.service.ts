import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { UsersService } from "src/users/users.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateSignIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const { username, password } = signInDto;

    const userFound = await this.usersService.findOneByUsername(username);
    if (!userFound) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const payload = {
      username: userFound.username,
      email: userFound.email,
      name: userFound.name,
      role: userFound.role,
    };

    return {
      access_token: await this.signToken(payload),
    };
  }

  private async signToken(payload: any): Promise<string> {
    const options = {
      secret: this.configService.get<string>("JWT_SECRET"),
      issuer: this.configService.get<string>("JWT_ISSUER") || "http://localhost:3000/auth",
      audience: this.configService.get<string>("JWT_AUDIENCE") || "http://localhost:8080",
      expiresIn: "1h",
    };

    return this.jwtService.signAsync(payload, options);
  }

  async handleSignUp(signUpDto: SignUpDto): Promise<{ access_token: string }> {
    const newUser = await this.usersService.create(signUpDto);

    const payload = {
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    return {
      access_token: await this.signToken(payload),
    };
  }
}
