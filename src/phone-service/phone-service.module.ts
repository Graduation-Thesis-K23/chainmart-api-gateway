import { Module } from "@nestjs/common";

import { PhoneServiceService } from "./phone-service.service";

@Module({
  providers: [PhoneServiceService],
  exports: [PhoneServiceService],
})
export class PhoneServiceModule {}
