const phoneRegex = /^\d{10}$/;
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export enum AccountType {
  PHONE = 1,
  EMAIL = 2,
  USERNAME = 3,
}

const accountType = (account: string) => {
  if (account.match(phoneRegex)) {
    return AccountType.PHONE;
  } else if (account.match(emailRegex)) {
    return AccountType.EMAIL;
  } else {
    return AccountType.USERNAME;
  }
};

export default accountType;
