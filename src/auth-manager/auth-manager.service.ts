import { Injectable } from '@nestjs/common';
import { CreateAuthManagerDto } from './dto/create-auth-manager.dto';
import { UpdateAuthManagerDto } from './dto/update-auth-manager.dto';

@Injectable()
export class AuthManagerService {
  create(createAuthManagerDto: CreateAuthManagerDto) {
    return 'This action adds a new authManager';
  }

  findAll() {
    return `This action returns all authManager`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authManager`;
  }

  update(id: number, updateAuthManagerDto: UpdateAuthManagerDto) {
    return `This action updates a #${id} authManager`;
  }

  remove(id: number) {
    return `This action removes a #${id} authManager`;
  }
}
