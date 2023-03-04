import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { configValidationSchema } from "./config/validate-env";
import { UsersModule } from "./users/users.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
