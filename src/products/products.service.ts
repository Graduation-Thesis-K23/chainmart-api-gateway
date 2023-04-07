import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import slugify from "slugify";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { S3Service } from "../s3/s3.service";

class AddProductType extends CreateProductDto {
  images: string;
  slug: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
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

  async getAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async getById(id: string): Promise<Product> {
    return await this.productRepository.findOneBy({
      id,
    });
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

    if (result.affected === 1) {
      return "A product  has been deleted";
    }
    return `Product ${id} have been deleted`;
  }
}
function uniqueFile(arg0: string, arg1: string) {
  throw new Error("Function not implemented.");
}