import { BadRequestException, Controller, Get, Inject, Query } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

import { SearchService } from "./search.service";
import { ProductQueryDto } from "./dto/product-query.dto";
import { lastValueFrom, timeout } from "rxjs";

@Controller("search")
export class SearchController {
  constructor(
    private readonly searchService: SearchService,

    @Inject("SEARCH_SERVICE")
    private readonly searchClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = ["product", "health-check"];
    topics.forEach((topic) => {
      this.searchClient.subscribeToResponseOf(`search.${topic}`);
    });
    this.searchClient.subscribeToResponseOf("search.orders");
    await this.searchClient.connect();
  }

  @Get("health-check")
  async healthCheck() {
    console.log("search.health-check received");
    try {
      const $res = this.searchClient.send("search.health-check", {}).pipe(timeout(5000));

      return await lastValueFrom($res);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get("products")
  findAll(@Query() query: ProductQueryDto) {
    return this.searchService.searchProduct(query.keyword);
  }

  @Get("orders")
  findAllOrders(@Query() query: ProductQueryDto) {
    return this.searchService.findAllOrders(query.keyword);
  }
}
