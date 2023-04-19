import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get("OAUTH_CLIENT_ID"),
      clientSecret: configService.get("OAUTH_CLIENT_SECRET"),
      callbackURL: configService.get("OAUTH_CALLBACK_URL"),
      scope: ["profile", "email"],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { displayName, email, picture } = profile;

    const user = {
      email,
      name: displayName,
      avatar: picture,
    };

    done(null, user);
  }
}
