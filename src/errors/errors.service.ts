import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErrorEntity } from "./entities/error.entity";

interface ErrorType {
  statusCode: number;
  message: string;
  error: string;
}

@Injectable()
export class ErrorsService {
  constructor(
    @InjectRepository(ErrorEntity)
    private readonly errorRepository: Repository<ErrorEntity>,
  ) {}

  async save(error: ErrorType) {
    console.log(error);
    if (error.statusCode >= 400 && error.statusCode < 500) {
      throw new BadRequestException(error.message);
    }

    const errorEntity = new ErrorEntity(error.message, error.error);

    const { id } = await this.errorRepository.save(errorEntity);

    throw new BadRequestException(id);
  }

  async findAll() {
    return await this.errorRepository
      .createQueryBuilder("error")
      .orderBy("created_at", "DESC")
      .limit(10)
      .select(["id", "message", "created_at"])
      .getMany();
  }

  async findOne(id: string) {
    const error = await this.errorRepository.createQueryBuilder("error").where("id = :id", { id }).getOne();

    if (!error) {
      throw new Error(`Error with id ${id} not found`);
    }

    return error;
  }
}
