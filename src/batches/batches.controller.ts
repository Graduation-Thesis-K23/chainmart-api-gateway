import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  OnModuleInit,
  Inject,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { Request } from "express";

import { BatchesService } from "./batches.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { EmployeePayload, Role } from "~/shared";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { Public } from "~/auth-manager/decorators/public.decorator";

@Controller("batches")
@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
export class BatchesController implements OnModuleInit {
  constructor(
    private readonly batchesService: BatchesService,

    @Inject("BATCH_SERVICE")
    private readonly batchClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = [
      "create",
      "findall",
      "findallbyproductid",
      "findbyid",
      "update",
      "delete",
      "getavailablequantity",
      "get_remaining_quantity",
      "get-sold-by-ids",
    ];
    topics.forEach((topic) => {
      this.batchClient.subscribeToResponseOf(`batches.${topic}`);
    });
    await this.batchClient.connect();
  }

  @Post()
  @Roles(Role.Branch)
  create(@Body() createBatchDto: CreateBatchDto, @Req() req: Request) {
    try {
      const { phone } = req.user as EmployeePayload;
      return this.batchesService.create(phone, createBatchDto);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get()
  @Roles(Role.Branch)
  findAll(@Req() req: Request) {
    try {
      const { phone } = req.user as EmployeePayload;

      return this.batchesService.findAll(phone);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get("products/:id")
  @Roles(Role.Branch)
  findAllByProductId(@Param("id") productId: string) {
    try {
      return this.batchesService.findAllByProductId(productId);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get("available")
  @Roles(Role.Employee, Role.Branch)
  getAvailable(@Req() req: Request, @Query("ids") ids: string) {
    try {
      console.log("req.user", req.user);
      const { phone } = req.user as EmployeePayload;
      return this.batchesService.getAvailable(phone, ids.split(","));
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get(":id")
  @Roles(Role.Branch)
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    try {
      return this.batchesService.findById(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  /*   @Patch(":id")
  @Roles(Role.Branch)
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchesService.update(id, updateBatchDto);
  }
 */

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Branch)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    try {
      return this.batchesService.delete(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Public()
  @Get("remaining-quantity/:id")
  getRemainingQuantity(@Param("id") id: string) {
    try {
      return this.batchesService.getRemainingQuantity(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
