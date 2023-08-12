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
  Query,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ClientKafka } from "@nestjs/microservices";

import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Roles } from "../auth-manager/decorators/roles.decorator";
import { RolesGuard } from "../auth-manager/guards/role.guard";
import { Role } from "~/shared";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { GetProductsDto } from "./dto/get-products.dto";
import { SearchAndFilterQueryDto } from "./dto/search-and-filter.dto";

@Controller("products")
export class ProductsController implements OnModuleInit {
  constructor(
    private readonly productsService: ProductsService,

    @Inject("PRODUCT_SERVICE")
    private readonly productClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = [
      "create",
      "findall",
      "findbyids",
      "findbyid",
      "findbyslug",
      "update",
      "delete",
      "staticpaths",
      "search-and-filter",
      "search",
      "get-products-by-main",
    ];
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
  async findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query.page, query.limit);
  }

  @Get("main")
  getProductsByMain() {
    return this.productsService.getProductsByMain();
  }

  @Get("search-and-filter")
  searchAndFilter(@Query() query: SearchAndFilterQueryDto) {
    return this.productsService.searchAndFilter(query);
  }

  @Get("search/:keyword")
  search(@Param("keyword") keyword: string) {
    return this.productsService.search(keyword);
  }

  @Get("static-paths")
  staticPaths() {
    return this.productsService.staticPaths();
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
