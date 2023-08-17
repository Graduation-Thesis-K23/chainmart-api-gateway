import { Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

@Injectable()
export class MailService {
  constructor(
    @Inject("EMAIL_SERVICE")
    private readonly emailClient: ClientKafka,
  ) {}

  async sendOtp(name: string, otp: string, receiver: string) {
    this.emailClient.emit("email.sendOtp", {
      name,
      otp,
      receiver,
    });
  }

  async sendNewPassword(name: string, password: string, receiver: string) {
    this.emailClient.emit("email.sendNewPassword", {
      name,
      password,
      receiver,
    });
  }
}
