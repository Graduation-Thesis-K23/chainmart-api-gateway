import { CanActivate, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtShipperAuthGuard extends AuthGuard("jwt-shipper") implements CanActivate {}
