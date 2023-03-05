import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { configValidationSchema } from "./config/validate-env";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", `.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {}
