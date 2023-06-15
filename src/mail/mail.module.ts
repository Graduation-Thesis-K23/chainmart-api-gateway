import { Module } from "@nestjs/common";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MailerModule } from "@nestjs-modules/mailer";
import { join } from "path";

import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("MAIL_HOST"),
          port: 465,
          secure: true,
          service: "gmail",
          auth: {
            user: configService.get<string>("MAIL_USER"),
            pass: configService.get<string>("MAIL_PASSWORD"),
          },
        },
        defaults: {
          from: "chainmart.otp@gmail.com",
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
