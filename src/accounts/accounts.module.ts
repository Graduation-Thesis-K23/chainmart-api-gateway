import { Module } from "@nestjs/common";

import { AccountsService } from "./accounts.service";
import { AccountsController } from "./accounts.controller";
import { UsersModule } from "../users/users.module";
import { GoogleConnectStrategy } from "../auth/strategies/google-connect.strategy";

@Module({
  imports: [UsersModule],
  controllers: [AccountsController],
  providers: [GoogleConnectStrategy, AccountsService],
})
export class AccountsModule {}
