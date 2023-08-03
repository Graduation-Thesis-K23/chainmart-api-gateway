import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom, timeout } from "rxjs";

@Injectable()
export class CartsService {
  constructor(
    @Inject("CARTS_SERVICE")
    private readonly cartsClient: ClientKafka,
  ) {}

  async get(username: string) {
    try {
      const $source = this.cartsClient.send("carts.get", username).pipe(timeout(5000));

      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Data is not valid!");
    }
  }

  async update(username: string, carts: string) {
    try {
      const $source = this.cartsClient
        .send("carts.update", {
          username,
          carts,
        })
        .pipe(timeout(5000));

      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot update cart with id(${username})`);
    }
  }

  async remove(username: string) {
    try {
      const $source = this.cartsClient.send("carts.remove", username).pipe(timeout(5000));

      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot delete cart with id(${username})`);
    }
  }
}
