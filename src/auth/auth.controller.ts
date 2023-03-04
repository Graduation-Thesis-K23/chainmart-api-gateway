import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-in")
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.validateSignIn(signInDto);
  }

  @Post("sign-up")
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.handleSignUp(signUpDto);
  }
}
