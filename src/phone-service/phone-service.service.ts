import { Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

@Injectable()
export class PhoneService {
  constructor(
    @Inject("PHONE_SERVICE")
    private readonly phoneClient: ClientKafka,
  ) {}

  async sendOtp(receiver: string, otp: string) {
    this.phoneClient.emit("phone.sendOtp", {
      receiver,
      otp,
    });
  }

  async sendPassword(receiver: string, password: string) {
    this.phoneClient.emit("phone.sendPassword", {
      receiver,
      password,
    });
  }
}
