import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { S3Service } from "./s3.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { Public } from "../auth/decorators/public.decorator";

@UseGuards(JwtAuthGuard)
@Public()
@Controller("s3")
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get(":id")
  async getByKey(@Param("id") id: string, @Res() res: Response) {
    const src = await this.s3Service.getFile(id);
    res.redirect(src);
  }
}
