import { Controller, Post, Body, Res, UseGuards, Req, Get } from "@nestjs/common";
import { Response, Request } from "express";

import { SignInDto } from "./dto/sign-in.dto";
import { JwtShipperAuthGuard } from "./guards/jwt-shipper.guards";
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
    const [token, payload] = await this.authShipperService.signIn(signInDto);

    console.log(payload);
    console.log(token);

    res.send({
      ...payload,
      token,
    });
  }

  @Post("change-password")
  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  async changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {
    const { phone } = req.user as EmployeePayload;

    return this.authShipperService.changePassword(phone, changePasswordDto);
  }

  @Get("check-token")
  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  async checkToken(@Req() req: Request) {
    return req.user;
  }
}
