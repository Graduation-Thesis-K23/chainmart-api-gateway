import { Controller, Post, Body, Res, UseGuards, Req, Get } from "@nestjs/common";
import { Response, Request } from "express";

import { AuthManagerService } from "./auth-manager.service";
import { SignInDto } from "./dto/sign-in.dto";
import { JwtEmployeeAuthGuard } from "./guards/jwt-employee.guards";
import { RolesGuard } from "./guards/role.guard";
import { Roles } from "./decorators/roles.decorator";
import { Role } from "~/shared";
import { Public } from "~/auth/decorators";

@Controller("auth-manager")
export class AuthManagerController {
  constructor(private readonly authManagerService: AuthManagerService) {}

  @Post("sign-in")
  @Public()
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const [access_token, payload] = await this.authManagerService.signIn(signInDto);

    res.cookie("access_token_manager", access_token, {
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

  @Get("logout")
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Branch, Role.Employee, Role.Manager, Role.Shipper)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token_manager").send();
  }
}
