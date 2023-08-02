import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

import { firstValueFrom, timeout } from "rxjs";

@Injectable()
export class RatesService {
  constructor(
    @Inject("RATE_SERVICE")
    private readonly rateClient: ClientKafka,
  ) {}

  async getRatesByUsername(username: string) {
    try {
      console.log("getRatesByUsername", username);

      const $source = this.rateClient.send("rates.getratesbyusername", username).pipe(timeout(5000));

      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getRatesByProductId(productId: string) {
    try {
      console.log("getRatesByProductId", productId);

      const $source = this.rateClient.send("rates.getratesbyproductid", productId).pipe(timeout(5000));

      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);

      throw new BadRequestException(error);
    }
  }
}
