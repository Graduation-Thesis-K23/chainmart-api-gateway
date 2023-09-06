import { BadRequestException, Inject, Injectable } from "@nestjs/common";
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
import { ClientKafka } from "@nestjs/microservices";
import { instanceToPlain } from "class-transformer";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly s3Service: S3Service,

    @Inject("RATE_SERVICE")
    private readonly rateClient: ClientKafka,

    @Inject("NOTIFICATION_SERVICE")
    private readonly notificationClient: ClientKafka,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.usersRepository.create(createUserDto);
      const newUser = await this.usersRepository.save(user);

      this.rateClient.emit("rates.signin", {
        username: newUser.username,
        name: newUser.name,
      });
      this.notificationClient.emit(
        "notification.users.created",
        instanceToPlain({
          sync_id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          phone: newUser.phone,
          email: newUser.email,
        }),
      );

      return newUser;
    } catch (error) {
      if (isQueryFailedError(error)) {
        if (error.code === "23505") {
          throw new BadRequestException("Duplicate key");
        }
      }
    }
  }

  async convertUsernameToId(username: string): Promise<string> {
    const user = await this.findOneByUsername(username);
    return user.id;
  }

  async createUserFromGoogleLogin(createGoogleUserDto: CreateGoogleUserDto): Promise<User> {
    try {
      const user = this.usersRepository.create(createGoogleUserDto);
      const newUser = await this.usersRepository.save(user);

      this.rateClient.emit("rates.signin", {
        username: newUser.username,
        name: newUser.name,
        photo: newUser.photo,
      });

      this.notificationClient.emit(
        "notification.users.created",
        instanceToPlain({
          sync_id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          phone: newUser.phone,
          email: newUser.email,
        }),
      );

      return newUser;
    } catch (error) {
      if (isQueryFailedError(error)) {
        if (error.code === "23505") {
          throw new BadRequestException("Duplicate key");
        }
      }
    }
  }

  async getAccountsByUsername(username: string) {
    const { facebook, hasFacebookVerify, email, hasEmailVerify } = await this.findOneByUsername(username);
    return { facebook, hasFacebookVerify, email, hasEmailVerify, username };
  }

  async createUserFromFacebookLogin(createFacebookUserDto: CreateFacebookUserDto): Promise<User> {
    try {
      const user = this.usersRepository.create(createFacebookUserDto);
      const newUser = await this.usersRepository.save(user);

      this.rateClient.emit("rates.signin", {
        username: newUser.username,
        name: newUser.name,
      });
      this.notificationClient.emit(
        "notification.users.created",
        instanceToPlain({
          sync_id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          phone: newUser.phone,
          email: newUser.email,
        }),
      );

      return newUser;
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

  async findOneByPhone(phone: string) {
    const user = await this.usersRepository.findOneBy({ phone });
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

      return {
        image,
      };
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

    if (!user.password) {
      user.password = newPassword;

      await this.save(user);

      return {
        messageCode: "setting.changePasswordSuccess",
      };
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);

    if (!isMatch) {
      return {
        messageCode: "setting.currentPasswordIncorrect",
      };
    }

    user.password = newPassword;

    await this.save(user);

    return {
      messageCode: "setting.changePasswordSuccess",
    };
  }

  // Dashboard
  async getNewUserByDate(startDate: string, endDate: string) {
    /* 
    SELECT COUNT(id) as value, to_char(created_at, 'yyyy-mm-dd') as label
    FROM public.users
    WHERE created_at >= '2023-01-01 00:00:00' AND created_at <= '2023-03-31 23:59:59'
    GROUP BY label
    ORDER BY label ASC;
    */

    const query = this.usersRepository
      .createQueryBuilder("users")
      .select("COUNT(id)", "value")
      .addSelect("to_char(created_at, 'yyyy-mm-dd')", "label")
      .where("created_at >= :startDate AND created_at <= :endDate", { startDate, endDate })
      .groupBy("label")
      .orderBy("label", "ASC")
      .limit(30)
      .getRawMany();

    return query;
  }
}
