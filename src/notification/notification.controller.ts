import { BadRequestException, Controller, Get, Inject } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom, timeout } from "rxjs";

@Controller("notification")
export class NotificationController {
  constructor(
    @Inject("NOTIFICATION_SERVICE")
    private readonly notificationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.notificationClient.subscribeToResponseOf("notification.health-check");
    await this.notificationClient.connect();
  }

  @Get("health-check")
  async healCheck() {
    try {
      const $res = this.notificationClient.send("notification.health-check", {}).pipe(timeout(5000));
      return await lastValueFrom($res);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
