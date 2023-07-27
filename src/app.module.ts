import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { configValidationSchema } from "./config/validate-env";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { SuppliersModule } from "./suppliers/suppliers.module";
import { ProductsModule } from "./products/products.module";
import { S3Module } from "./s3/s3.module";
import { AddressModule } from "./address/address.module";
import { CartsModule } from "./carts/carts.module";
import { LogsMiddleware } from "./middlewares/logger";
import { AuthManagerModule } from "./auth-manager/auth-manager.module";
import { AccountsModule } from "./accounts/accounts.module";
import { MailModule } from "./mail/mail.module";
import { PhoneServiceModule } from "./phone-service/phone-service.module";
import { EmployeeModule } from "./employee/employee.module";
import { BranchModule } from "./branch/branch.module";
import { OrdersModule } from "./orders/orders.module";
import { BatchesModule } from "./batches/batches.module";
import { ErrorsModule } from "./errors/errors.module";
import { AuthShipperModule } from "./auth-shipper/auth-shipper.module";
import { SearchModule } from "./search/search.module";
import { DashboardModule } from "./dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", `.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),

    DatabaseModule,
    UsersModule,
    AuthModule,
    SuppliersModule,
    ProductsModule,
    S3Module,
    AddressModule,
    CartsModule,
    AuthManagerModule,
    AccountsModule,
    MailModule,
    PhoneServiceModule,
    EmployeeModule,
    BranchModule,
    OrdersModule,
    BatchesModule,
    ErrorsModule,
    AuthShipperModule,
    SearchModule,
    DashboardModule,
  ],
  exports: [ConfigModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes("*");
  }
}
