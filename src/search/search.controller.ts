import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

import { SearchService } from "./search.service";
import { ProductQueryDto } from "./dto/product-query.dto";

@Controller("search")
export class SearchController {
  constructor(
    private readonly searchService: SearchService,

    @Inject("SEARCH_SERVICE")
    private readonly searchClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = ["product"];
    topics.forEach((topic) => {
      this.searchClient.subscribeToResponseOf(`search.${topic}`);
    });
    await this.searchClient.connect();
  }

  @Get("products")
  findAll(@Query() query: ProductQueryDto) {
    return this.searchService.searchProduct(query.keyword);
  }
}
