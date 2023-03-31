import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { S3Service } from "../s3/s3.service";

class AddProductType extends CreateProductDto {
  image: string;
  images: string[];
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    private readonly s3Service: S3Service,
  ) {}

  async create(createProductDto: CreateProductDto, arrBuffer: Buffer[]): Promise<Product> {
    const [image, images]: [image: string, images: string[]] = await this.s3Service.uploadImagesToS3(arrBuffer);

    const newProduct = {
      ...createProductDto,
      image,
      images: images.join(","),
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
