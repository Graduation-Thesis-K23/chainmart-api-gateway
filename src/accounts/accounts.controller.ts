import { Controller, Get, Param } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AccountsService } from "./accounts.service";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService, private readonly configService: ConfigService) {}

  @Get(":username")
  async getAccountsByUsername(@Param("username") username: string) {
    return await this.accountsService.getAccountsByUsername(username);
  }
}
