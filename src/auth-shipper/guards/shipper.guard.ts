import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IS_SHIPPER } from "../decorators/shipper.decorator";

@Injectable()
export class ShipperGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isShipper = this.reflector.getAllAndOverride<boolean>(IS_SHIPPER, [context.getHandler(), context.getClass()]);

    const { user } = context.switchToHttp().getRequest();

    return isShipper && user.role === "SHIPPER";
  }
}
