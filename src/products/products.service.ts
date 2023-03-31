import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(createProductDto);
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
