import { BatchesService } from "./../batches/batches.service";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom, lastValueFrom, timeout } from "rxjs";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

import { S3Service } from "~/s3/s3.service";
import { SearchAndFilterQueryDto } from "./dto/search-and-filter.dto";
import { CommentsService } from "~/comments/comments.service";

@Injectable()
export class ProductsService {
  constructor(
    @Inject("PRODUCT_SERVICE")
    private readonly productClient: ClientKafka,

    private readonly batchesService: BatchesService,

    private readonly s3Service: S3Service,

    private readonly commentsService: CommentsService,
  ) {}

  async create(createProductDto: CreateProductDto, arrBuffer: Buffer[]) {
    if (arrBuffer.length < 2) {
      throw new BadRequestException("Require minimum 2 images.");
    }

    try {
      const images = await this.s3Service.uploadImagesToS3(arrBuffer);

      const $source = this.productClient.send("products.create", { ...createProductDto, images }).pipe(timeout(5000));

      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const $source = this.productClient
        .send("products.findall", {
          page,
          limit,
        })
        .pipe(timeout(5000));

      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getProductsByMain() {
    try {
      const $source = this.productClient.send("products.get-products-by-main", {}).pipe(timeout(5000));
      const products = await lastValueFrom($source);

      const ids = products.map((product) => product._id);

      const stars = await this.commentsService.getStarByIds(ids);
      const solds = await this.batchesService.getSoldByIds(ids);

      console.log(stars, solds);

      const result = products.map((product) => {
        const star = stars.find((star) => star.productId === product._id);
        const sold = solds.find((sold) => sold.productId === product._id);

        return {
          ...product,
          star: star?.star || 0,
          sold: sold?.sold || 0,
        };
      });

      console.log(result);

      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async staticPaths() {
    try {
      const $source = this.productClient.send("products.staticpaths", {}).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findByIds(ids: string[]) {
    try {
      const $source = this.productClient.send("products.findbyids", ids).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findById(id: string) {
    try {
      const $source = this.productClient.send("products.findbyid", id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findBySlug(slug: string) {
    try {
      const $source = this.productClient.send("products.findbyslug", slug).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const $source = this.productClient.send("products.update", { id, ...updateProductDto }).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async delete(id: string) {
    try {
      const $source = this.productClient.send("products.delete", id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async searchAndFilter(query: SearchAndFilterQueryDto) {
    console.log(query);
    try {
      const $source = this.productClient.send("products.search-and-filter", { ...query }).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async search(keyword: string) {
    try {
      const $source = this.productClient.send("products.search", keyword).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }
}
