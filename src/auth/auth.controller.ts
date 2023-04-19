import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
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

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-in")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Public()
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const [access_token, payload] = await this.authService.validateSignIn(signInDto);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      // secure: true,
      // sameSite: "lax",
    });
    res.locals.username = payload.username;
    res.locals.email = payload.email;
    res.locals.role = payload.role;
    res.locals.name = payload.name;
    res.send(payload);
  }

  @Post("sign-up")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Public()
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.handleSignUp(signUpDto);
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
  async googleCallback(@Req() req: Request) {
    return req.user;
  }

  @Get("facebook")
  @UseGuards(FacebookOauthGuard)
  async facebook() {
    return;
  }

  @Get("facebook/callback")
  @UseGuards(FacebookOauthGuard)
  async facebookCallback(@Req() req: Request) {
    return req.user;
  }
}
