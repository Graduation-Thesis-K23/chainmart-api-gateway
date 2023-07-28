import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CartDetailParam } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { Cart } from "./entities/cart.entity";
import { User } from "~/users/entities/user.entity";
import { ProductsService } from "~/products/products.service";

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly productsService: ProductsService,
  ) {}

  async create(username, createCartDto: CartDetailParam) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const user_id = user.id;
    const product_id = createCartDto.product_id;

    // get cart by user_id and product_id
    const previousCart = await this.cartRepository.findOneBy({
      user_id,
      product_id,
    });

    console.log("previousCart", previousCart);

    if (!previousCart) {
      // create new cart
      const newCart = this.cartRepository.create({
        user_id,
        product_id,
        quantity: createCartDto.quantity,
      });

      const temp = await this.cartRepository.save(newCart);
      console.log("save when no previous cart", temp);
      return {
        status: "success",
      };
    } else {
      // update cart
      const newCart = this.cartRepository.create({
        quantity: createCartDto.quantity + previousCart.quantity,
        id: previousCart.id,
        user_id,
        product_id,
      });

      const temp = await this.cartRepository.save(newCart);
      console.log("save when previous cart", temp);
      return {
        status: "success",
      };
    }
  }

  async findAll(username: string) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const user_id = user.id;

    //get all cart by user_id
    const carts = await this.cartRepository.findBy({ user_id });
    if (carts.length === 0) {
      return [];
    }
    const ids = carts.map((cart) => cart.product_id);

    const products = await this.productsService.findByIds(ids);

    const result = carts.map((cart) => {
      const product = products.find((product) => product.id === cart.product_id);
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
        quantity: cart.quantity,
        maxQuantity: 25,
      };
    });

    return result;
  }

  async updateCart(username: string, action, product_id: string) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const user_id = user.id;
    const productInCart = await this.cartRepository.findOneBy({
      user_id,
      product_id,
    });

    if (!productInCart) {
      throw new BadRequestException("Product not found in cart");
    }

    if (action === "increase") {
      const newCart = this.cartRepository.create({
        quantity: productInCart.quantity + 1,
        id: productInCart.id,
        user_id,
        product_id,
      });

      await this.cartRepository.save(newCart);
    } else if (action === "decrease") {
      const newCart = this.cartRepository.create({
        quantity: productInCart.quantity - 1,
        id: productInCart.id,
        user_id,
        product_id,
      });

      await this.cartRepository.save(newCart);
    }

    return {
      status: "success",
    };
  }

  async removeCart(username: string, product_id: string) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const user_id = user.id;

    const productInCart = await this.cartRepository.findOneBy({
      user_id,
      product_id,
    });

    if (!productInCart) {
      throw new BadRequestException("Product not found in cart");
    }

    console.log(productInCart);

    console.log("productInCart.id", productInCart.id);

    await this.cartRepository.softRemove(productInCart);

    return {
      status: "success",
    };
  }

  /*  async findOne(id: string): Promise<Cart> {
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
  } */

  /* async findOneByUserId(userId: string): Promise<Cart> {
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
 */
  async update(id: string, updateCartDto: UpdateCartDto): Promise<any> {
    console.log(updateCartDto);
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
