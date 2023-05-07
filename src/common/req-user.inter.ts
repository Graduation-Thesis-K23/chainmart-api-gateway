import { Role } from "src/users/enums/role.enum";

export interface ReqUser {
  username: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
}
