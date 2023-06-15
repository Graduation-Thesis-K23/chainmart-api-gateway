import { Controller, Get } from "@nestjs/common";
import { MailService } from "./mail.service";
import generateOTP from "../utils/generate-otp";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  async sendOtp() {
    return this.mailService.sendOtp("hiep", generateOTP(), "hiepnguyen6014@gmail.com");
  }
}
