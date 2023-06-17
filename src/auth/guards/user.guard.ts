import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IS_USER } from "../decorators";
import { USER_ROLE } from "../../shared/constants";

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isUser = this.reflector.getAllAndOverride<boolean>(IS_USER, [context.getHandler(), context.getClass()]);

    const { user } = context.switchToHttp().getRequest();

    return isUser && user.role === USER_ROLE;
  }
}
