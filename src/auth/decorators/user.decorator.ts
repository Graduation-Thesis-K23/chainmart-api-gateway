import { SetMetadata } from "@nestjs/common";

export const IS_USER = "isUser";
export const User = () => SetMetadata(IS_USER, true);
