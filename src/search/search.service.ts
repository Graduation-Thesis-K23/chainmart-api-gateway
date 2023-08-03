import { BadGatewayException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom, timeout } from "rxjs";

@Injectable()
export class SearchService {
  constructor(
    @Inject("SEARCH_SERVICE")
    private readonly searchClient: ClientKafka,
  ) {}

  async searchProduct(text: string) {
    try {
      const $source = this.searchClient.send("search.product", text).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadGatewayException(error);
    }
  }
}
