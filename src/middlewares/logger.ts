import { Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const logger = new Logger("HTTP");

export const LogsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl } = req;
  const { statusCode } = res;

  const message = `${method} ${originalUrl} ${statusCode}`;

  if (statusCode >= 500) {
    logger.error(message);
    next();
  }

  if (statusCode >= 400) {
    logger.warn(message);
    next();
  }

  logger.log(message);
  next();
};
