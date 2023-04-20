import { ConfigService } from "@nestjs/config";
import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { RolesGuard } from "./guards/role.guard";
import { Roles } from "./decorators/roles.decorator";
import { Role } from "../users/enums/role.enum";
import { Public } from "./decorators/public.decorator";
import { GoogleOauthGuard } from "./guards/google.guard";
import { FacebookOauthGuard } from "./guards/facebook.guard";
import { FacebookDto } from "./dto/facebook.dto";
import { GoogleDto } from "./dto/google.dto";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post("sign-in")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Public()
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const [access_token, payload] = await this.authService.validateSignIn(signInDto);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: true,
    });

    res.send(payload);
  }

  @Post("sign-up")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Public()
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    const [access_token, payload] = await this.authService.handleSignUp(signUpDto);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: true,
    });

    res.send(payload);
  }

  @Get("check-username/:username")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Public()
  async checkUsername(@Param("username") username: string) {
    return await this.authService.checkUsername(username);
  }

  @Post("check-token")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Employee, Role.User)
  async checkToken(@Req() req: Request) {
    return req.user;
  }

  @Get("logout")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Employee, Role.User)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token").send();
  }

  @Get("google")
  @UseGuards(GoogleOauthGuard)
  async google() {
    return;
  }

  @Get("google/callback")
  @UseGuards(GoogleOauthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user: GoogleDto = req.user as GoogleDto;

    const [access_token, payload] = await this.authService.handleGoogleLogin(user);
    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: true,
    });

    res.send(payload);
    res.redirect(this.configService.get("CLIENT_URL"));
  }

  @Get("facebook")
  @UseGuards(FacebookOauthGuard)
  async facebook() {
    return;
  }

  @Get("facebook/callback")
  @UseGuards(FacebookOauthGuard)
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    const user: FacebookDto = req.user as FacebookDto;
    const [access_token, payload] = await this.authService.handleFacebookLogin(user);
    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: true,
    });

    res.send(payload);
    res.redirect(this.configService.get("CLIENT_URL"));
  }

  /* @Get("oauth")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Public()
  async getAccessToken(@Query("refresh_token") refresh_token: string, @Res() res: Response) {
    const [access_token, payload] = await this.authService.createAccessFromRefresh(refresh_token);
    console.log(access_token, payload);
    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      domain: this.configService.get("CLIENT_URL"),
      // secure: true,
    });
    res.send(payload);
  } */
}
