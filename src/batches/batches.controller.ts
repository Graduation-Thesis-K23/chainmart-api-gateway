import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus } from "@nestjs/common";

import { BatchesService } from "./batches.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { Role } from "~/shared";

@Controller("batches")
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @Roles(Role.Employee)
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchesService.create(createBatchDto);
  }

  @Get()
  @Roles(Role.Employee)
  findAll() {
    return this.batchesService.findAll();
  }

  @Get("products/:id")
  @Roles(Role.Employee)
  findAllByProductId(@Param("id", new ParseUUIDPipe({ version: "4" })) productId: string) {
    return this.batchesService.findAllByProductId(productId);
  }

  @Get(":id")
  @Roles(Role.Employee)
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.batchesService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.Employee)
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchesService.update(id, updateBatchDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Employee)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.batchesService.remove(id);
  }
}
