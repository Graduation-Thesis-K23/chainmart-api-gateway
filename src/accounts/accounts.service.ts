import { Injectable } from "@nestjs/common";

import { UsersService } from "../users/users.service";
import { GoogleDto } from "~/auth/dto";

@Injectable()
export class AccountsService {
  constructor(private readonly usersService: UsersService) {}

  async getAccountsByUsername(username: string) {
    const { facebook, hasFacebookVerify, email, hasEmailVerify } = await this.usersService.findOneByUsername(username);
    return { facebook, hasFacebookVerify, email, hasEmailVerify, username };
  }

  async handleGoogleLogin(user: GoogleDto) {
    console.log(user);
  }


}
