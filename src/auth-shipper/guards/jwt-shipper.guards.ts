import { CanActivate, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtShipperGuard extends AuthGuard("jwt-shipper") implements CanActivate {}
