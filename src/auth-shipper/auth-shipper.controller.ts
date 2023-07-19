import { Controller, Post, Body, Res, UseGuards, Req, Get } from "@nestjs/common";
import { Response, Request } from "express";

import { SignInDto } from "./dto/sign-in.dto";
import { JwtShipperGuard } from "./guards/jwt-shipper.guards";
import { EmployeePayload } from "~/shared";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { Shipper } from "./decorators/shipper.decorator";
import { Public } from "~/auth/decorators";
import { AuthShipperService } from "./auth-shipper.service";
import { ShipperGuard } from "./guards/shipper.guard";

@Controller("auth-shipper")
export class AuthShipperController {
  constructor(private readonly authShipperService: AuthShipperService) {}

  @Post("sign-in")
  @Public()
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const [access_token, payload] = await this.authShipperService.signIn(signInDto);

    res.send({
      ...payload,
      access_token,
    });
  }

  @Post("check-token")
  @UseGuards(JwtShipperGuard, ShipperGuard)
  @Shipper()
  async checkToken(@Req() req: Request) {
    return req.user;
  }

  @Post("change-password")
  @UseGuards(JwtShipperGuard, ShipperGuard)
  @Shipper()
  async changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {
    const { phone } = req.user as EmployeePayload;

    return this.authShipperService.changePassword(phone, changePasswordDto);
  }

  @Get("logout")
  @UseGuards(JwtShipperGuard, ShipperGuard)
  @Shipper()
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token_manager").send();
  }
}
