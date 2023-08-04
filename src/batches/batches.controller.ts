import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  OnModuleInit,
  Inject,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { Request } from "express";

import { BatchesService } from "./batches.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { EmployeePayload, Role } from "~/shared";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";

@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
@Controller("batches")
@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
export class BatchesController implements OnModuleInit {
  constructor(
    private readonly batchesService: BatchesService,

    @Inject("BATCH_SERVICE")
    private readonly batchClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = ["create", "findall", "findallbyproductid", "findbyid", "update", "delete", "getavailablequantity"];
    topics.forEach((topic) => {
      this.batchClient.subscribeToResponseOf(`batches.${topic}`);
    });
    await this.batchClient.connect();
  }

  @Post()
  @Roles(Role.Branch)
  create(@Body() createBatchDto: CreateBatchDto, @Req() req: Request) {
    const { phone } = req.user as EmployeePayload;

    return this.batchesService.create(phone, createBatchDto);
  }

  @Get()
  @Roles(Role.Branch)
  findAll(@Req() req: Request) {
    const { phone } = req.user as EmployeePayload;

    return this.batchesService.findAll(phone);
  }

  @Get("products/:id")
  @Roles(Role.Branch)
  findAllByProductId(@Param("id") productId: string) {
    return this.batchesService.findAllByProductId(productId);
  }

  @Get(":id")
  @Roles(Role.Branch)
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.batchesService.findById(id);
  }

  /*   @Patch(":id")
  @Roles(Role.Branch)
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchesService.update(id, updateBatchDto);
  }
 */
  @Get("available")
  @Roles(Role.Employee)
  getAvailable(@Req() req: Request, @Body() getAvailable: string[]) {
    console.log("req.user", req.user);
    const { phone } = req.user as EmployeePayload;
    return this.batchesService.getAvailable(phone, getAvailable);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Branch)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.batchesService.delete(id);
  }
}
