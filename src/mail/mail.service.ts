import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOtp(name: string, otp: string, receiver: string) {
    return await this.mailerService.sendMail({
      to: receiver,
      subject: "Chainmart OTP",
      template: "./otp",
      context: {
        name,
        otp,
      },
    });
  }
}
