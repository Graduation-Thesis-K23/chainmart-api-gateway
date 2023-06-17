import { CanActivate, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtEmployeeAuthGuard extends AuthGuard("jwt-employee") implements CanActivate {}
