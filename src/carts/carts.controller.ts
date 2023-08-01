import { Controller, Get, Body, Patch, Delete, Inject, UseGuards, Req, BadRequestException } from "@nestjs/common";
import { Request } from "express";

import { CartsService } from "./carts.service";
import { ClientKafka } from "@nestjs/microservices";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { User } from "~/auth/decorators";
import { ReqUser } from "~/common/req-user.inter";

@UseGuards(JwtAuthGuard, UserGuard)
@Controller("carts")
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,

    @Inject("CARTS_SERVICE")
    private readonly cartsClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = ["update", "remove", "get"];
    topics.forEach((topic) => {
      this.cartsClient.subscribeToResponseOf(`carts.${topic}`);
    });
    await this.cartsClient.connect();
  }

  @Get()
  @User()
  get(@Req() req: Request) {
    const { username } = req.user as ReqUser;
    return this.cartsService.get(username);
  }

  @Patch()
  @User()
  update(@Body("carts") carts: string, @Req() req: Request) {
    const { username } = req.user as ReqUser;

    try {
      return this.cartsService.update(username, carts);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @Delete()
  @User()
  remove(@Req() req: Request) {
    const { username } = req.user as ReqUser;

    return this.cartsService.remove(username);
  }
}
