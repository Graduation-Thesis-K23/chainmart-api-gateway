import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthManagerDto } from './create-auth-manager.dto';

export class UpdateAuthManagerDto extends PartialType(CreateAuthManagerDto) {}
