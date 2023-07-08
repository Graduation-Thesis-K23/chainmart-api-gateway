import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  BadRequestException,
  UseGuards,
  HttpCode,
  OnModuleInit,
  Inject,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ClientKafka } from "@nestjs/microservices";

import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Roles } from "../auth-manager/decorators/roles.decorator";
import { RolesGuard } from "../auth-manager/guards/role.guard";
import { Public } from "../auth/decorators/public.decorator";
import { Role } from "~/shared";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";

@Controller("products")
export class ProductsController implements OnModuleInit {
  constructor(
    private readonly productsService: ProductsService,

    @Inject("PRODUCT_SERVICE")
    private readonly productClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = ["create", "findall", "findbyids", "findbyid", "findbyslug", "update", "delete"];
    topics.forEach((topic) => {
      this.productClient.subscribeToResponseOf(`products.${topic}`);
    });
    await this.productClient.connect();
  }

  @Post()
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Admin)
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
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    images: Express.Multer.File[],
  ) {
    const arrBuffer = images.map((image) => image.buffer);
    return this.productsService.create(createProductDto, arrBuffer);
  }

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.productsService.findById(id);
  }

  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Patch(":id")
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Employee)
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Employee)
  delete(@Param("id") id: string) {
    return this.productsService.delete(id);
  }
}
