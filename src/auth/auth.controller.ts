import { ConfigService } from "@nestjs/config";
import { Body, Controller, Get, Param, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { FacebookOauthGuard, GoogleOauthGuard, JwtAuthGuard, UserGuard } from "./guards";
import { FacebookDto, GoogleDto, SignInDto, SignUpDto } from "./dto";
import { Public, User } from "./decorators";
import { UserPayload } from "~/shared";
import { ConfirmOtp } from "./dto/confirm-otp.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post("sign-in")
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const [access_token, payload] = await this.authService.validateSignIn(signInDto);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.send(payload);
  }

  @Post("sign-up")
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    const [access_token, payload] = await this.authService.handleSignUp(signUpDto);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.send(payload);
  }

  @Post("check-token")
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  async checkToken(@Req() req: Request) {
    return req.user;
  }

  @Post("reset-password")
  @Public()
  async resetPassword(@Body("account") account: string) {
    return await this.authService.resetPassword(account);
  }

  @Post("confirm-otp")
  @Public()
  async confirmOtp(@Body() confirmOtp: ConfirmOtp) {
    return await this.authService.confirmOtp(confirmOtp);
  }

  @Get("logout")
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
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
      sameSite: "none",
      secure: true,
    });
    res.cookie("user", JSON.stringify(payload), {
      sameSite: "lax",
      // secure: true,
    });

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
      sameSite: "none",
      // secure: true,
    });
    res.cookie("user", JSON.stringify(payload), {
      sameSite: "lax",
      // secure: true,
    });

    res.redirect(this.configService.get("CLIENT_URL"));
  }

  @Get(":username")
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  async getAccountsByUsername(@Param("username") username: string, @Req() req: Request) {
    const user = req.user as UserPayload;

    if (user.username !== username) {
      throw new UnauthorizedException();
    }

    return await this.authService.getAccountsByUsername(username);
  }
}
