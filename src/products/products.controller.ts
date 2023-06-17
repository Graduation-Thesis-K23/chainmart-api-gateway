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
  UseGuards,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";

import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { Roles } from "../auth-manager/decorators/roles.decorator";
import { Role } from "src/users/enums/role.enum";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "../auth-manager/guards/role.guard";
import { Public } from "src/auth/decorators/public.decorator";

@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.Admin, Role.Employee)
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
  @Public()
  getAll(): Promise<Product[]> {
    return this.productsService.getAll();
  }

  @Get("search/:searchText")
  @Public()
  getSearchProduct(@Param("searchText") searchText: string): Promise<Product[]> {
    return this.productsService.getSearchProduct(searchText);
  }

  @Get(":id")
  @Public()
  getById(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string): Promise<Product> {
    return this.productsService.getById(id);
  }

  @Get("slug/:slug")
  @Public()
  getBySlug(@Param("slug") slug: string): Promise<Product> {
    return this.productsService.getBySlug(slug);
  }

  @Patch(":id")
  @Roles(Role.Admin, Role.Employee)
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @Roles(Role.Admin, Role.Employee)
  delete(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.productsService.delete(id);
  }
}
