import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { configValidationSchema } from "./config/validate-env";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { SuppliersModule } from "./suppliers/suppliers.module";
import { ProductsModule } from "./products/products.module";
import { S3Module } from "./s3/s3.module";
import { AddressModule } from "./address/address.module";
import { EmployeeModule } from "./employee/employee.module";
import { BranchModule } from "./branch/branch.module";

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
    CategoriesModule,
    SuppliersModule,
    ProductsModule,
    S3Module,
    AddressModule,
    EmployeeModule,
    BranchModule,
  ],
})
export class AppModule {}
