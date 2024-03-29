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
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateUserSettingDto } from "./dto/update-user-setting.dto";
import { ReqUser } from "~/common/req-user.inter";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UserGuard } from "~/auth/guards";
import { User } from "~/auth/decorators";

@Controller("users")
@UseGuards(JwtAuthGuard, UserGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @User()
  @Get("setting")
  async getInfoUserSetting(@Req() req: Request) {
    const user = req.user as ReqUser;
    return await this.usersService.getUserInfoSetting(user.username);
  }

  @Get(":id")
  async findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.usersService.findOne(id);
  }

  @User()
  @Post("setting")
  async updateUserInfoSetting(@Req() req: Request, @Body() updateUserDto: UpdateUserSettingDto) {
    const user = req.user as ReqUser;
    return await this.usersService.updateUserInfoSetting(user.username, updateUserDto);
  }

  @User()
  @Patch(":id")
  async update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  async remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.usersService.remove(id);
  }

  @User()
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

  @User()
  @Post("change-password")
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: Request) {
    const user = req.user as ReqUser;
    return this.usersService.changePassword(
      user.username,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
