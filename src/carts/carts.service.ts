import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CartDetailParam, CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { Cart } from "./entities/cart.entity";
import { User } from "~/users/entities/user.entity";

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(username, createCartDto: CartDetailParam) {
    console.log("username", username);
    console.log("createCartDto", createCartDto);
    return {
      status: "success",
    };

    /* try {
      const user = await this.userRepository.findOneBy({ id: createCartDto.user_id });
      if (!user) {
        throw new BadRequestException("User not found");
      }

      const userPreviousCart = await this.findOneByUserId(createCartDto.user_id);

      const cart = this.cartRepository.create({ ...createCartDto, user });

      return await this.cartRepository.save({
        ...userPreviousCart,
        ...cart,
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Data is not valid!");
    } */
  }

  async findAll(username: string): Promise<Cart[]> {
    console.log(username);
    return [];
    /* try {
      return await this.cartRepository.find({
        relations: {
          user: true,
          cart_details: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find carts");
    } */
  }

  async updateCart(username: string, action, product_id: string) {
    console.log(username);
    console.log(action);
    console.log(product_id);
    return {
      status: "success",
    };
    /* try {
      return await this.cartRepository.find({
        relations: {
          user: true,
          cart_details: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find carts");
    } */
  }

  async removeCart(username: string, product_id: string) {
    console.log(username);
    console.log(product_id);
    return {
      status: "success",
    };
    /* try {
      return await this.cartRepository.find({
        relations: {
          user: true,
          cart_details: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find carts");
    } */
  }

  async findOne(id: string): Promise<Cart> {
    try {
      return await this.cartRepository.findOne({
        relations: {
          user: true,
          cart_details: true,
        },
        where: {
          id,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot find cart with id(${id})`);
    }
  }

  async findOneByUserId(userId: string): Promise<Cart> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new BadRequestException("User not found");
      }

      return await this.cartRepository.findOne({
        relations: {
          user: true,
          cart_details: true,
        },
        where: {
          user: {
            id: userId,
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find cart with for this user");
    }
  }

  async update(id: string, updateCartDto: UpdateCartDto): Promise<any> {
    try {
      return `This action updates a #${id} cart`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot update cart with id(${id})`);
    }
  }

  async remove(id: string): Promise<string> {
    try {
      const result = await this.cartRepository.softDelete(id);

      if (result.affected === 0) {
        throw new BadRequestException(`Cart with id(${id}) not found`);
      }

      return `Cart with id(${id}) have been deleted`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot delete cart with id(${id})`);
    }
  }
}
