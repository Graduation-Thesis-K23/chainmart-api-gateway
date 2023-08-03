import { USER_ROLE, BRANCH_ROLE, EMPLOYEE_ROLE, SHIPPER_ROLE, ADMIN_ROLE } from "../shared/constants";

export interface ReqUser {
  username: string;
  role: typeof USER_ROLE;
  avatar: string;
}

export interface ReqBranch extends Omit<ReqUser, "role"> {
  role: typeof BRANCH_ROLE;
}

export interface ReqEmployee extends Omit<ReqUser, "role"> {
  role: typeof EMPLOYEE_ROLE;
}

export interface ReqShipper extends Omit<ReqUser, "role"> {
  role: typeof SHIPPER_ROLE;
}

export interface ReqAdmin extends Omit<ReqUser, "role"> {
  role: typeof ADMIN_ROLE;
}
