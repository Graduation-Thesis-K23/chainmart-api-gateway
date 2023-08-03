import { Controller, Get, Param, UseGuards, Req, Inject } from "@nestjs/common";
import { Request } from "express";
import { RatesService } from "./rates.service";
import { ReqUser } from "~/common/req-user.inter";
import { User } from "~/auth/decorators";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { ClientKafka } from "@nestjs/microservices";

@Controller("rates")
export class RatesController {
  constructor(
    private readonly ratesService: RatesService,

    @Inject("RATE_SERVICE")
    private readonly rateClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = ["getratesbyusername", "getratesbyproductid"];
    topics.forEach((topic) => {
      this.rateClient.subscribeToResponseOf(`rates.${topic}`);
    });
    await this.rateClient.connect();
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Get()
  getRatesByUsername(@Req() req: Request) {
    const user = req.user as ReqUser;

    return this.ratesService.getRatesByUsername(user.username);
  }

  @Get(":id/product")
  getRatesByProductId(@Param("id") id: string) {
    return this.ratesService.getRatesByProductId(id);
  }
}
