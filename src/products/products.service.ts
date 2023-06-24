import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import slugify from "slugify";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { S3Service } from "../s3/s3.service";
import { ProductListType, ProductType } from "~/shared";
import { SearchAndFilterQueryDto } from "./dto/search-and-filter.dto";

class AddProductType extends CreateProductDto {
  images: string;
  slug: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly s3Service: S3Service,
  ) {}

  async create(createProductDto: CreateProductDto, arrBuffer: Buffer[]): Promise<Product> {
    const images = await this.s3Service.uploadImagesToS3(arrBuffer);

    const newProduct: AddProductType = {
      ...createProductDto,
      images,
      slug: slugify(createProductDto.name, { lower: true }) + "-" + Date.now().toString(),
    };

    return await this.productRepository.save(newProduct);
  }

  async getSearchProduct(searchText: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder("products")
      .select(["products.name", "products.price", "products.images", "products.slug"])
      .where("LOWER(products.name) like LOWER(:searchText)", { searchText: `%${searchText}%` })
      .getMany();
  }

  async getAll(): Promise<ProductListType[]> {
    const products = await this.productRepository
      .createQueryBuilder("products")
      .select([
        "products.id",
        "products.name",
        "products.price",
        "products.sale",
        "products.images",
        "products.created_at",
        "products.slug",
        "products.sold",
        "products.rating",
        "products.isHot",
      ])
      .orderBy("products.sold", "DESC")
      .limit(20)
      .getMany();

    return products.map((product) => {
      return {
        ...product,
        images: product.images.split(","),
        created_at: product.created_at.toISOString(),
      };
    });
  }

  async searchAndFilter(query: SearchAndFilterQueryDto): Promise<ProductListType[]> {
    const queryProperties = Object.keys(query);

    const products = this.productRepository
      .createQueryBuilder("products")
      .select([
        "products.id",
        "products.name",
        "products.price",
        "products.images",
        "products.created_at",
        "products.slug",
        "products.sold",
        "products.rating",
        "products.isHot",
        "products.sale",
      ])
      .where("products.name like :keyword", { keyword: `%${query.keyword}%` });

    if (queryProperties.includes("categories")) {
      const categories = query.categories.split(",");
      products.andWhere("products.category IN (:...categories)", { categories });
    }
    if (queryProperties.includes("minPrice")) {
      products.andWhere("products.price >= :minPrice", { minPrice: query.minPrice });
    }

    if (queryProperties.includes("maxPrice")) {
      products.andWhere("products.price <= :maxPrice", { maxPrice: query.maxPrice });
    }

    if (queryProperties.includes("orderBy")) {
      const orderBy = query.orderBy.toLowerCase();
      // ["asc", "desc", "latest", "sales"]
      if (orderBy === "asc" || orderBy === "desc") {
        const order: "ASC" | "DESC" = orderBy === "asc" ? "ASC" : "DESC";
        products.orderBy("products.price", order);
      } else if (orderBy === "latest") {
        products.orderBy("products.created_at", "DESC");
      } else if (orderBy === "sales") {
        products.orderBy("COALESCE(sale, 0)", "DESC");
      }
    }

    // execute query
    const result = await products.getMany();

    return result.map((product) => {
      return {
        ...product,
        images: product.images.split(","),
        created_at: product.created_at.toISOString(),
      };
    });
  }

  async getById(id: string): Promise<Product> {
    return await this.productRepository.findOneBy({
      id,
    });
  }

  async getBySlug(slug: string): Promise<ProductType> {
    const product = await this.productRepository
      .createQueryBuilder("products")
      .select([
        "products.id",
        "products.name",
        "products.price",
        "products.sale",
        "products.images",
        "products.created_at",
        "products.slug",
        "products.sold",
        "products.rating",
        "products.isHot",
        "products.description",
        "products.specifications",
        "products.category",
        "products.numberOfComments",
      ])
      .where("products.slug = :slug", { slug })
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product with slug(${slug}) not found`);
    }

    return {
      ...product,
      images: product.images.split(","),
      created_at: product.created_at.toISOString(),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const newProduct = {
      ...product,
      ...updateProductDto,
    };

    try {
      return await this.productRepository.save(newProduct);
    } catch (error) {
      throw new BadRequestException(error.code);
    }
  }

  async delete(id: string): Promise<string> {
    const result = await this.productRepository.softDelete(id);

    if (result.affected === 0) {
      throw new BadRequestException(`Product with id(${id}) not found`);
    }

    return `Product with id(${id}) have been deleted`;
  }
}
