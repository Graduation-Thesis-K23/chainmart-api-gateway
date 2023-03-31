import * as joi from "joi";

export const configValidationSchema = joi.object({
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().default(5432).required(),
  DB_USERNAME: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_DATABASE: joi.string().required(),
  DB_SCHEMA: joi.string().required(),

  CLIENT_URL: joi.string().required(),
  MANAGER_URL: joi.string().required(),

  JWT_SECRET: joi.string().required(),

  BUCKET_NAME: joi.string().required(),
  IAM_USER_KEY: joi.string().required(),
  IAM_USER_SECRET: joi.string().required(),
});
