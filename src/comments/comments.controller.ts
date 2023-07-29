import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { User } from "~/auth/decorators";
import { Request } from "express";
import { ReqUser } from "~/common/req-user.inter";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Get()
  getCommentsByUser(@Req() req: Request) {
    const user = req.user as ReqUser;

    return this.commentsService.getCommentsByUser(user.username);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Get(":id/product")
  getCommentsByProduct(@Param("id") id: string) {
    return this.commentsService.getCommentsByProduct(id);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Get(":id/order")
  getCommentsByOrder(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as ReqUser;

    return this.commentsService.getCommentsByOrder(user.username, id);
  }
}
