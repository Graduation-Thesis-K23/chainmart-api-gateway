import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as uniqueFilename from "unique-filename";

import { UsersService } from "../users/users.service";
import { MailService } from "../mail/mail.service";
import { FacebookDto, GoogleDto, SignInDto, SignUpDto } from "./dto";
import { USER_ROLE } from "../shared/constants";
import { UserPayload } from "../shared";
import { CreateGoogleUserDto } from "../users/dto/create-google-user.dto";
import { CreateFacebookUserDto } from "../users/dto/create-facebook-user.dto";
import accountType, { AccountType } from "~/utils/account-type";
import { PhoneService } from "../phone-service/phone-service.service";
import generateOTP from "../utils/generate-otp";
import { ConfirmOtp } from "./dto/confirm-otp.dto";
import checkExpiry from "../utils/check-expiry";
import { User } from "../users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly phoneService: PhoneService,
  ) {}

  async validateSignIn(signInDto: SignInDto): Promise<[string, UserPayload]> {
    const { account, password } = signInDto;

    const type = accountType(account);
    let userFound: User;

    if (type === AccountType.EMAIL) {
      userFound = await this.usersService.findOneByEmail(account);
      if (!userFound) {
        throw new UnauthorizedException("account.accountNotExist");
      }
    } else if (type === AccountType.PHONE) {
      userFound = await this.usersService.findOneByPhone(account);
      if (!userFound) {
        throw new UnauthorizedException("account.accountNotExist");
      }
    } else {
      userFound = await this.usersService.findOneByUsername(account);
      if (!userFound) {
        throw new UnauthorizedException("account.accountNotExist");
      }
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      throw new UnauthorizedException("account.inValid");
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

  async getAccountsByUsername(username: string) {
    const { facebook, hasFacebookVerify, email, hasEmailVerify } = await this.usersService.findOneByUsername(username);
    return { facebook, hasFacebookVerify, email, hasEmailVerify, username };
  }

  async resetPassword(account: string) {
    const type = accountType(account);

    if (type === AccountType.EMAIL) {
      const userExist = await this.usersService.findOneByEmail(account);

      if (!userExist) {
        throw new BadRequestException("account.emailNotExist");
      }

      const emailOtp = generateOTP();

      userExist.otp = emailOtp;
      userExist.expiryOtp = new Date(Date.now() + 5 * 60 * 1000); // otp take effect 5 minute

      await this.mailService.sendOtp(userExist.name, emailOtp, account);

      await this.usersService.save(userExist);

      return { statusCode: 200 };
    } else if (type === AccountType.PHONE) {
      const userExist = await this.usersService.findOneByPhone(account);

      if (!userExist) {
        throw new BadRequestException("account.phoneNotExist");
      }

      const phoneOtp = generateOTP();

      userExist.otp = phoneOtp;
      userExist.expiryOtp = new Date(Date.now() + 5 * 60 * 1000); // otp take effect 5 minute

      await this.phoneService.sendOtp(account, phoneOtp);

      await this.usersService.save(userExist);

      return { statusCode: 200 };
    }

    throw new BadRequestException("account.notValid");
  }

  async confirmOtp(confirmOtp: ConfirmOtp) {
    const { account, otp } = confirmOtp;

    const type = accountType(account);

    if (type === AccountType.EMAIL) {
      const userExist = await this.usersService.findOneByEmail(account);

      if (!userExist) {
        throw new BadRequestException("account.emailNotExist");
      }

      const expiryOtpIso = new Date(userExist.expiryOtp).toISOString();

      if (checkExpiry(expiryOtpIso) && otp === userExist.otp) {
        userExist.otp = null;
        userExist.expiryOtp = null;
        const newPassword: string = uniqueFilename("", "");
        userExist.password = newPassword;

        this.usersService.save(userExist);
        // send new-password to mail
        this.mailService.sendNewPassword(userExist.name, newPassword, account);
      } else {
        if (otp !== userExist.otp) {
          throw new BadRequestException("account.otpInvalid");
        } else {
          throw new BadRequestException("account.otpExpiry");
        }
      }

      return { statusCode: 200 };
    } else if (type === AccountType.PHONE) {
      const userExist = await this.usersService.findOneByPhone(account);

      if (!userExist) {
        throw new BadRequestException("account.phoneNotExist");
      }

      const expiryOtpIso = new Date(userExist.expiryOtp).toISOString();

      if (expiryOtpIso && otp === userExist.otp) {
        userExist.otp = null;
        userExist.expiryOtp = null;
        const newPassword: string = uniqueFilename("", "");
        userExist.password = newPassword;

        this.usersService.save(userExist);
        // send new-password to mail
        this.phoneService.sendPassword(account, newPassword);
      } else {
        if (otp !== userExist.otp) {
          throw new BadRequestException("account.otpInvalid");
        } else {
          throw new BadRequestException("account.otpExpiry");
        }
      }

      return { statusCode: 200 };
    }

    throw new BadRequestException("account.notValid");
  }

  private async signToken(payload: any): Promise<string> {
    const options = {
      secret: this.configService.get<string>("JWT_SECRET"),
      issuer: this.configService.get<string>("JWT_ISSUER") || "http://localhost:3000/auth",
      audience: this.configService.get<string>("JWT_AUDIENCE") || "http://localhost:8080",
      expiresIn: "365d",
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
        photo: userExist.photo,
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
