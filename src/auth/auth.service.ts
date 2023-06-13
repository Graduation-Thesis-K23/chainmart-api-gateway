import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as uniqueFilename from "unique-filename";

import { UsersService } from "../users/users.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { FacebookDto } from "./dto/facebook.dto";
import { GoogleDto } from "./dto/google.dto";
import { USER_ROLE } from "./constants";
import { UserPayload } from "../shared";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateSignIn(signInDto: SignInDto): Promise<[string, UserPayload]> {
    const { username, password } = signInDto;

    const userFound = await this.usersService.findOneByUsername(username);
    if (!userFound) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const payload: UserPayload = {
      username: userFound.username,
      email: userFound.email,
      name: userFound.name,
      photo: userFound.photo,
      role: USER_ROLE,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload];
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

  async handleSignUp(signUpDto: SignUpDto): Promise<[string, UserPayload]> {
    const usernameExist = await this.usersService.findOneByUsername(signUpDto.username);

    if (usernameExist) {
      throw new BadRequestException("username.existed");
    }

    const emailExist = await this.usersService.findOneByEmail(signUpDto.email);

    if (emailExist) {
      throw new BadRequestException("email.existed");
    }

    const newUser = await this.usersService.create(signUpDto);

    const payload: UserPayload = {
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: USER_ROLE,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload];
  }

  async handleFacebookLogin(user: FacebookDto): Promise<[string, UserPayload]> {
    /* const userExist = await this.usersService.findOneByEmail(user.email);

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
      const { email, name, role, avatar } = await this.usersService.create(userTemp);

      const payload: Payload = {
        username,
        email,
        name,
        role,
        avatar,
      };

      const access_token = await this.signToken(payload);

      return [access_token, payload];
    }

    if (!userExist.facebook) {
      userExist.facebook = true;
    }

    this.usersService.save(userExist);

    const payload: Payload = {
      username: userExist.username,
      email: userExist.email,
      name: userExist.name,
      role: userExist.role,
      avatar: userExist.avatar,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload]; */
    return ["", {} as UserPayload];
  }

  async handleGoogleLogin(user: GoogleDto): Promise<[string, UserPayload]> {
    /* const userExist = await this.usersService.findOneByEmail(user.email);

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
      const { email, name, avatar, role } = await this.usersService.create(userTemp);

      const payload: Payload = {
        username,
        email,
        name,
        avatar,
        role,
      };

      const access_token = await this.signToken(payload);

      return [access_token, payload];
    }

    if (!userExist.google) {
      userExist.google = true;
    }

    if (!userExist.avatar) {
      userExist.avatar = user.avatar;
    }

    const { username, email, name, role, avatar } = await this.usersService.save(userExist);

    const payload: Payload = {
      email,
      username,
      name,
      role,
      avatar,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload]; */
    return ["", {} as UserPayload];
  }

  async checkUsername(username: string) {
    return this.usersService.checkUsername(username);
  }
}
