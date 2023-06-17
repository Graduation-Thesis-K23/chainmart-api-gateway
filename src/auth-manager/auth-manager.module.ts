import { Module } from '@nestjs/common';
import { AuthManagerService } from './auth-manager.service';
import { AuthManagerController } from './auth-manager.controller';

@Module({
  controllers: [AuthManagerController],
  providers: [AuthManagerService]
})
export class AuthManagerModule {}
