import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get("OAUTH_APP_ID"),
      clientSecret: configService.get("OAUTH_APP_SECRET"),
      callbackURL: configService.get("OAUTH_CALLBACK_URL_FACEBOOK"),
      scope: "email",
      profileFields: ["email", "name"],
      fbGraphVersion: "v3.2",
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails } = profile;

    const user = {
      email: emails[0].value,
      name: `${name.familyName} ${name.givenName}`,
    };

    done(null, user);
  }
}
