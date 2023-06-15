import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { isQueryFailedError } from "../utils/is-query-failed";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { S3Service } from "../s3/s3.service";
import { UpdateUserSettingDto } from "./dto/update-user-setting.dto";
import { CreateGoogleUserDto } from "./dto/create-google-user.dto";
import { CreateFacebookUserDto } from "./dto/create-facebook-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly s3Service: S3Service,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (isQueryFailedError(error)) {
        if (error.code === "23505") {
          throw new BadRequestException("Duplicate key");
        }
      }
    }
  }

  async createUserFromGoogleLogin(createGoogleUserDto: CreateGoogleUserDto): Promise<User> {
    try {
      return await this.usersRepository.save(createGoogleUserDto);
    } catch (error) {
      console.log(error);
      if (isQueryFailedError(error)) {
        if (error.code === "23505") {
          throw new BadRequestException("Duplicate key");
        }
      }
    }
  }

  async createUserFromFacebookLogin(createFacebookUserDto: CreateFacebookUserDto): Promise<User> {
    try {
      return await this.usersRepository.save(createFacebookUserDto);
    } catch (error) {
      if (isQueryFailedError(error)) {
        if (error.code === "23505") {
          throw new BadRequestException("Duplicate key");
        }
      }
    }
  }

  async save(user: User): Promise<User> {
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (isQueryFailedError(error)) {
        if (error.code === "23505") {
          throw new BadRequestException("Duplicate key");
        }
      }
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    if (!isUUID(id)) {
      throw new BadRequestException("Invalid ID");
    }

    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new BadRequestException(`User with id(${id}) not found`);
    }

    return user;
  }

  async findOneByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email });
    return user;
  }

  async findOneByFacebookId(facebook: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ facebook });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<string> {
    if (!isUUID(id)) {
      throw new BadRequestException("Invalid ID");
    }

    const result = await this.usersRepository.update(id, updateUserDto);

    if (result.affected === 0) {
      throw new BadRequestException(`User with id(${id}) not found`);
    }

    if (result.affected === 1) {
      return "A user has been updated";
    }
    return `${result.affected} users have been updated`;
  }

  async remove(id: string): Promise<string> {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new BadRequestException(`User with id(${id}) not found`);
    }

    if (result.affected === 1) {
      return "A user has been deleted";
    }
    return `${result.affected} users have been deleted`;
  }

  async checkUsername(username: string) {
    const user = await this.usersRepository.findOneBy({ username });
    return user !== null;
  }

  async changeAvatar(img: Buffer, username: string) {
    try {
      const image = await this.s3Service.uploadImageToS3(img);
      const user = await this.findOneByUsername(username);
      user.photo = image;
      await this.save(user);
      return image;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getUserInfoSetting(username: string) {
    const user = await this.usersRepository.findOne({
      where: {
        username,
      },
      select: {
        name: true,
        birthday: true,
        phone: true,
        gender: true,
      },
    });

    if (!user) {
      throw new BadRequestException(`User with username(${username}) not found`);
    }

    return user;
  }

  async updateUserInfoSetting(username: string, updateUserDto: UpdateUserSettingDto) {
    const user = await this.findOneByUsername(username);

    const newUser = {
      ...user,
      ...updateUserDto,
    };

    const { name, birthday, phone, gender } = await this.usersRepository.save(newUser);

    return { name, birthday, phone, gender };
  }

  async changePassword(username: string, currentPassword: string, newPassword: string) {
    if (currentPassword === newPassword) {
      throw new BadRequestException("new password the same current password");
    }

    const user = await this.findOneByUsername(username);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException("current password is not correct");
    }

    user.password = newPassword;

    await this.save(user);

    return {
      messageCode: "setting.changePasswordSuccess",
    };
  }
}
