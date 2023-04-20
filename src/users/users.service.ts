import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { isQueryFailedError } from "../utils/is-query-failed";
import { Repository } from "typeorm";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

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
}
