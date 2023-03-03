import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { User } from "./user.entity";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/signup")
  async signUp(@Body() signInDto: SignInDto): Promise<User> {
    return await this.authService.signUp(signInDto);
  }
}
