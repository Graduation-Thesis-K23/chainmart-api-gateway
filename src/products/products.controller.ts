import { S3Service } from "./../s3/s3.service";
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";

import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor("images", 10, {
      // dest: "./images",
      limits: { files: 10, fileSize: 1024 * 1000 * 10 },
      fileFilter(_, file, callback) {
        ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)
          ? callback(null, true)
          : callback(new BadRequestException("image/png, image/jpeg, image/webp is accept"), false);
      },
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    images: Express.Multer.File[],
  ) {
    if (images.length < 2) {
      throw new BadRequestException("Minimum 2 images.");
    }

    const arrBuffer: Buffer[] = images.map((image) => image.buffer);
    return this.productsService.create(createProductDto, arrBuffer);
  }

  @Get()
  getAll(): Promise<Product[]> {
    return this.productsService.getAll();
  }

  @Get(":id")
  getById(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string): Promise<Product> {
    return this.productsService.getById(id);
  }

  @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  delete(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.productsService.delete(id);
  }
}
