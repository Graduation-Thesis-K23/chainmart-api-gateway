import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthManagerService } from './auth-manager.service';
import { CreateAuthManagerDto } from './dto/create-auth-manager.dto';
import { UpdateAuthManagerDto } from './dto/update-auth-manager.dto';

@Controller('auth-manager')
export class AuthManagerController {
  constructor(private readonly authManagerService: AuthManagerService) {}

  @Post()
  create(@Body() createAuthManagerDto: CreateAuthManagerDto) {
    return this.authManagerService.create(createAuthManagerDto);
  }

  @Get()
  findAll() {
    return this.authManagerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authManagerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthManagerDto: UpdateAuthManagerDto) {
    return this.authManagerService.update(+id, updateAuthManagerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authManagerService.remove(+id);
  }
}
