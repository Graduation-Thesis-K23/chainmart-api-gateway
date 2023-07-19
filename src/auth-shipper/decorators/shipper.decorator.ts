import { SetMetadata } from "@nestjs/common";

export const IS_SHIPPER = "isShipper";
export const Shipper = () => SetMetadata(IS_SHIPPER, true);
