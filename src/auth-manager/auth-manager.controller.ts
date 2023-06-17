import { Controller, Post, Body, Res, UseGuards, Req } from "@nestjs/common";
import { Response, Request } from "express";

import { AuthManagerService } from "./auth-manager.service";
import { SignInDto } from "./dto/sign-in.dto";
import { JwtEmployeeAuthGuard } from "./guards/jwt-employee.guards";
import { RolesGuard } from "./guards/role.guard";
import { Roles } from "./decorators/roles.decorator";
import { Role } from "src/shared";

@Controller("auth-manager")
export class AuthManagerController {
  constructor(private readonly authManagerService: AuthManagerService) {}

  @Post("sign-in")
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const [access_token, payload] = await this.authManagerService.signIn(signInDto);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: true,
    });

    res.send(payload);
  }

  @Post("check-token")
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Branch, Role.Employee, Role.Manager, Role.Shipper)
  async checkToken(@Req() req: Request) {
    return req.user;
  }
}
