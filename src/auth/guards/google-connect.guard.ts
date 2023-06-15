import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleConnectOauthGuard extends AuthGuard("google-connect") {}
