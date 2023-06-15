import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";

import { FacebookDto } from "../dto/facebook.dto";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get("OAUTH_APP_ID"),
      clientSecret: configService.get("OAUTH_APP_SECRET"),
      callbackURL: configService.get("OAUTH_CALLBACK_URL_FACEBOOK"),
      profileFields: ["displayName"],
      fbGraphVersion: "v3.0",
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    if (!profile) {
      done(new Error("Not login"), null);
    }

    const user: FacebookDto = {
      id: profile.id,
      name: profile.displayName,
    };

    done(null, user);
  }
}
