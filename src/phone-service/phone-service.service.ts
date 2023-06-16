import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PhoneServiceService {
  constructor(private readonly configService: ConfigService) {}

  async sendOTP(receiver: string, otp: string) {
    const urlPhoneServer = `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone=${receiver}&Content=${otp} la ma xac minh dang ky Baotrixemay cua ban&ApiKey=${this.configService.get<string>(
      "SMS_API_KEY",
    )}&SecretKey=${this.configService.get<string>("SMS_SECRET_KEY")}&Brandname=Baotrixemay&SmsType=2`;

    const result = (await fetch(urlPhoneServer)).json();

    return result;
  }
}
