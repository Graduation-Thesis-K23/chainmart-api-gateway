import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { GoogleDto } from "../dto/google.dto";

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
    if (!profile) {
      done(new Error("Not login"), null);
    }

    const { displayName, email, picture } = profile;

    const user: GoogleDto = {
      email,
      name: displayName,
      photo: picture,
    };

    done(null, user);
  }
}
