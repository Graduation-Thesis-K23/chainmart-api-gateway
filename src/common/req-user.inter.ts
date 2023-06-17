import { USER_ROLE } from "./../auth/constants";

export interface ReqUser {
  username: string;
  email: string;
  name: string;
  role: typeof USER_ROLE;
  avatar: string;
}
