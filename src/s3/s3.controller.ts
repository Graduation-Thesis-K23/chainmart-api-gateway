import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";

import { S3Service } from "./s3.service";

@Controller("s3")
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get(":id")
  async getByKey(@Param("id") id: string, @Res() res: Response) {
    const src = await this.s3Service.getFile(id);
    res.redirect(src);
  }
}
