import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as uniqueFilename from "unique-filename";

import { UsersService } from "../users/users.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { Role } from "src/users/enums/role.enum";
import { FacebookDto } from "./dto/facebook.dto";
import { GoogleDto } from "./dto/google.dto";

interface Payload {
  username: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateSignIn(signInDto: SignInDto): Promise<[string, Payload]> {
    const { username, password } = signInDto;

    const userFound = await this.usersService.findOneByUsername(username);
    if (!userFound) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const payload: Payload = {
      username: userFound.username,
      email: userFound.email,
      name: userFound.name,
      role: userFound.role,
      avatar: userFound.avatar,
    };

    return [await this.signToken(payload), payload];
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

  async handleSignUp(signUpDto: SignUpDto): Promise<[string, Payload]> {
    const newUser = await this.usersService.create(signUpDto);

    const payload: Payload = {
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload];
  }

  async handleFacebookLogin(user: FacebookDto): Promise<[string, Payload]> {
    const userExist = await this.usersService.findOneByEmail(user.email);

    if (!userExist) {
      const username: string = uniqueFilename("", "");

      const userTemp = {
        username,
        email: user.email,
        name: user.name,
        password: Date.now().toString(),
        facebook: true,
      };
      // save user to db
      const newUser = await this.usersService.create(userTemp);

      const payload: Payload = {
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
      };

      const access_token = await this.signToken(payload);

      return [access_token, payload];
    }

    if (!userExist.facebook) {
      userExist.facebook = true;
      this.usersService.save(userExist);
    }

    const payload: Payload = {
      username: userExist.username,
      email: userExist.email,
      name: userExist.name,
      role: userExist.role,
      avatar: userExist.avatar,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload];
  }

  async handleGoogleLogin(user: GoogleDto): Promise<[string, Payload]> {
    const userExist = await this.usersService.findOneByEmail(user.email);

    if (!userExist) {
      const username: string = uniqueFilename("", "");
      const userTemp = {
        username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        password: Date.now().toString(),
        google: true,
      };
      // save user to db
      const newUser = await this.usersService.create(userTemp);

      const payload: Payload = {
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
      };

      const access_token = await this.signToken(payload);

      return [access_token, payload];
    }

    if (!userExist.google) {
      userExist.google = true;
      this.usersService.save(userExist);
    }

    if (!userExist.avatar) {
      userExist.avatar = user.avatar;
      this.usersService.save(userExist);
    }

    const payload: Payload = {
      username: userExist.username,
      email: userExist.email,
      name: userExist.name,
      role: userExist.role,
      avatar: userExist.avatar,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload];
  }

  async checkUsername(username: string) {
    return this.usersService.checkUsername(username);
  }
}
