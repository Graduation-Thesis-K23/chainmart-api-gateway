import { Module } from "@nestjs/common";

import { PhoneService } from "./phone-service.service";

@Module({
  providers: [PhoneService],
  exports: [PhoneService],
})
export class PhoneServiceModule {}
