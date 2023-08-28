import { BadGatewayException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom, timeout } from "rxjs";
import { OrdersService } from "~/orders/orders.service";

@Injectable()
export class SearchService {
  constructor(
    @Inject("SEARCH_SERVICE")
    private readonly searchClient: ClientKafka,

    private readonly ordersService: OrdersService,
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

  async findAllOrders(text: string) {
    try {
      const $source = this.searchClient.send("search.orders", text).pipe(timeout(5000));
      const $orders = await lastValueFrom($source);

      const ids = $orders.map((order) => order.id);

      return this.ordersService.findAllByIds(ids);
    } catch (error) {
      console.error(error);
      throw new BadGatewayException(error);
    }
  }
}
