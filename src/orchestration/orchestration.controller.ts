import { Controller, Get, BadRequestException, Inject } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom, timeout } from "rxjs";

@Controller("orchestration")
export class OrchestrationController {
  constructor(
    @Inject("ORCHESTRATION_SERVICE")
    private readonly orchestrationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.orchestrationClient.subscribeToResponseOf("orchestration.health-check");
    await this.orchestrationClient.connect();
  }

  @Get("health-check")
  async healCheck() {
    try {
      const $res = this.orchestrationClient.send("orchestration.health-check", {}).pipe(timeout(5000));
      return await lastValueFrom($res);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
