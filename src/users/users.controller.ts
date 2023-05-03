import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  BadRequestException,
  ParseFilePipeBuilder,
  UploadedFile,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { Request } from "express";

import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Role } from "./enums/role.enum";
import { RolesGuard } from "../auth/guards/role.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateUserSettingDto } from "./dto/update-user-setting.dto";
import { ReqUser } from "src/common/req-user.inter";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Customer)
  @Get("setting")
  async getInfoUserSetting(@Req() req: Request) {
    const user = req.user as ReqUser;
    return await this.usersService.getUserInfoSetting(user.username);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(":id")
  async findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Post("setting")
  async updateUserInfoSetting(@Req() req: Request, @Body() updateUserDto: UpdateUserSettingDto) {
    const user = req.user as ReqUser;
    return await this.usersService.updateUserInfoSetting(user.username, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(":id")
  async update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(":id")
  async remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Employee)
  @Post("change-avatar")
  @UseInterceptors(
    FileInterceptor("image", {
      // dest: "./images",
      limits: { fileSize: 1024 * 1000 },
      fileFilter(_, file, callback) {
        ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)
          ? callback(null, true)
          : callback(new BadRequestException("image/png, image/jpeg, image/webp is accept"), false);
      },
    }),
  )
  async changeAvatar(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    image: Express.Multer.File,
    @Req() req: Request,
  ) {
    const imgBuffer: Buffer = image.buffer;
    const user = req.user as ReqUser;
    return await this.usersService.changeAvatar(imgBuffer, user.username);
  }
}
