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
import { CreateGoogleUserDto } from "../users/dto/create-google-user.dto";
import { CreateFacebookUserDto } from "../users/dto/create-facebook-user.dto";

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
      name: newUser.name,
      role: USER_ROLE,
    };

    const access_token = await this.signToken(payload);

    return [access_token, payload];
  }

  async handleFacebookLogin(user: FacebookDto): Promise<[string, UserPayload]> {
    const userExist = await this.usersService.findOneByFacebookId(user.id);

    if (!userExist) {
      const username: string = uniqueFilename("", "");

      const facebookUser: CreateFacebookUserDto = {
        username,
        facebook: user.id,
        name: user.name,
        hasFacebookVerify: true,
      };
      // save user to db
      const { name } = await this.usersService.createUserFromFacebookLogin(facebookUser);

      const payload: UserPayload = {
        username,
        name,
        role: USER_ROLE,
      };

      const access_token = await this.signToken(payload);

      return [access_token, payload];
    } else {
      const payload: UserPayload = {
        username: userExist.username,
        name: userExist.name,
        role: USER_ROLE,
      };

      const access_token = await this.signToken(payload);

      return [access_token, payload];
    }
  }

  async handleGoogleLogin(user: GoogleDto): Promise<[string, UserPayload]> {
    const userExist = await this.usersService.findOneByEmail(user.email);

    if (!userExist) {
      const username: string = uniqueFilename("", "");

      const googleUser: CreateGoogleUserDto = {
        username,
        email: user.email,
        name: user.name,
        photo: user.photo,
        hasEmailVerify: true,
      };

      // save user to db
      const { name, photo } = await this.usersService.createUserFromGoogleLogin(googleUser);

      const payload: UserPayload = {
        username,
        name,
        photo,
        role: USER_ROLE,
      };

      const access_token = await this.signToken(payload);

      return [access_token, payload];
    } else {
      if (!userExist.photo) {
        userExist.photo = user.photo;
      }

      const { username, name, photo } = await this.usersService.save(userExist);

      const payload: UserPayload = {
        username,
        name,
        role: USER_ROLE,
        photo,
      };

      const access_token = await this.signToken(payload);

      return [access_token, payload];
    }
  }

  async checkUsername(username: string) {
    return this.usersService.checkUsername(username);
  }
}
