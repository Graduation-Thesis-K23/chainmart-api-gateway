import { BadRequestException, Controller, Get, Inject, Param, Req, UseGuards } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { Public, User } from "~/auth/decorators";
import { Request } from "express";
import { ReqUser } from "~/common/req-user.inter";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom, timeout } from "rxjs";

@Controller("comments")
export class CommentsController {
  constructor(
    @Inject("RATE_SERVICE")
    private readonly rateClient: ClientKafka,
    private readonly commentsService: CommentsService,
  ) {}

  async onModuleInit() {
    const orderTopics = ["getratesbyusername", "getratesbyproductid", "get-star-by-ids", "health-check"];
    orderTopics.forEach((topic) => {
      this.rateClient.subscribeToResponseOf(`rates.${topic}`);
    });

    this.rateClient.connect();
  }

  @Get("health-check")
  async healthCheck() {
    try {
      const $res = this.rateClient.send("rates.health-check", {}).pipe(timeout(5000));

      return await lastValueFrom($res);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Get()
  getCommentsByUser(@Req() req: Request) {
    const user = req.user as ReqUser;

    return this.commentsService.getCommentsByUser(user.username);
  }

  @Public()
  @Get(":id/product")
  getCommentsByProduct(@Param("id") id: string) {
    return this.commentsService.getCommentsByProduct(id);
  }

  /*  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Get(":id/order")
  getCommentsByOrder(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as ReqUser;

    return this.commentsService.getCommentsByOrder(user.username, id);
  } */
}
