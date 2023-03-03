import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { AuthRepository } from "./auth.repository";
import { SignInDto } from "./dto/sign-in.dto";
import { User } from "./user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly authRepository: AuthRepository,
  ) {}

  async signUp(signInDto: SignInDto): Promise<User> {
    const user: User = {
      ...signInDto,
    };

    return this.authRepository.save(user);
  }
}
