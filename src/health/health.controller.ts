import { BadRequestException, Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from "@nestjs/terminus";

@Controller("health-check")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    console.log("Health check ----------------", this.configService.get<string>("HEALTH_CHECK_URL"));

    const check = await this.health.check([
      async () =>
        this.http.pingCheck("products", this.configService.get<string>("HEALTH_CHECK_URL") + "products/health-check"),
      async () =>
        this.http.pingCheck("batches", this.configService.get<string>("HEALTH_CHECK_URL") + "batches/health-check"),
      async () =>
        this.http.pingCheck("carts", this.configService.get<string>("HEALTH_CHECK_URL") + "carts/health-check"),
      async () =>
        this.http.pingCheck(
          "notification",
          this.configService.get<string>("HEALTH_CHECK_URL") + "notification/health-check",
        ),
      async () =>
        this.http.pingCheck(
          "orchestration",
          this.configService.get<string>("HEALTH_CHECK_URL") + "orchestration/health-check",
        ),
      async () =>
        this.http.pingCheck("orders", this.configService.get<string>("HEALTH_CHECK_URL") + "orders/health-check"),
      async () =>
        this.http.pingCheck("comments", this.configService.get<string>("HEALTH_CHECK_URL") + "comments/health-check"),
      async () =>
        this.http.pingCheck("search", this.configService.get<string>("HEALTH_CHECK_URL") + "search/health-check"),
    ]);

    if (check.status === "ok") {
      return check;
    } else {
      throw new BadRequestException(check);
    }
  }
}
