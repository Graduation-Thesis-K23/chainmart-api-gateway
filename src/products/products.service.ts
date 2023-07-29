import { CommentsService } from "~/comments/comments.service";
import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom, lastValueFrom, timeout } from "rxjs";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

import { S3Service } from "~/s3/s3.service";
import { SearchAndFilterQueryDto } from "./dto/search-and-filter.dto";

@Injectable()
export class ProductsService {
  constructor(
    @Inject("PRODUCT_SERVICE")
    private readonly productClient: ClientKafka,

    private readonly s3Service: S3Service,

    @Inject(forwardRef(() => CommentsService))
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

  async getProductByMain() {
    try {
      const $source = this.productClient
        .send("products.findall", {
          page: 1,
          limit: 20,
        })
        .pipe(timeout(5000));

      const { docs: products, ...metadata } = await lastValueFrom($source);

      const ids = products.map((product) => product.id);

      console.log("ids", ids);

      const avgStarByIds = await this.commentsService.getAverageStarByProducts(ids);

      const result = products.map((product) => {
        return {
          ...product,
          star: avgStarByIds[product.id] ? avgStarByIds[product.id] : -1,
        };
      });

      return {
        docs: result,
        ...metadata,
      };
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
    return this.findAll(query.page, 12);
  }

  async search(keyword: string) {
    console.log({ keyword });

    const result = await this.findAll(1, 5);

    return result.docs;
  }
}
