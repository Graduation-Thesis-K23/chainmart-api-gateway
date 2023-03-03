import { Repository } from "typeorm";
import { User } from "./user.entity";

export class AuthRepository extends Repository<User> {}
