import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1688675197537 implements MigrationInterface {
  name = "Update1688675197537";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cart_details" DROP CONSTRAINT "FK_9c56e71ba578cd23b493f4d1394"`);
    await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_ce1f689e43b39edd9330cadaeb8"`);
    await queryRunner.query(
      `CREATE TABLE "batches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "batch_code" character varying NOT NULL, "product_id" character varying NOT NULL, "import_quantity" integer NOT NULL, "import_cost" numeric NOT NULL, "expiry_date" date NOT NULL, "branch_id" uuid, "sold" integer NOT NULL DEFAULT '0', "employee_create_id" uuid, CONSTRAINT "PK_55e7ff646e969b61d37eea5be7a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "cart_details" DROP CONSTRAINT "PK_692a50ed34d5df324da19279b60"`);
    await queryRunner.query(
      `ALTER TABLE "cart_details" ADD CONSTRAINT "PK_c81e3af806614bbf45024de3ca4" PRIMARY KEY ("cart_id")`,
    );
    await queryRunner.query(`ALTER TABLE "cart_details" DROP COLUMN "product_id"`);
    await queryRunner.query(`ALTER TABLE "cart_details" ADD "product_id" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cart_details" DROP CONSTRAINT "PK_c81e3af806614bbf45024de3ca4"`);
    await queryRunner.query(
      `ALTER TABLE "cart_details" ADD CONSTRAINT "PK_692a50ed34d5df324da19279b60" PRIMARY KEY ("cart_id", "product_id")`,
    );
    await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "PK_b2a13944a814f28f54b46f8754f"`);
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "PK_3ff3367344edec5de2355a562ee" PRIMARY KEY ("order_id")`,
    );
    await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "product_id"`);
    await queryRunner.query(`ALTER TABLE "order_details" ADD "product_id" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "PK_3ff3367344edec5de2355a562ee"`);
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "PK_b2a13944a814f28f54b46f8754f" PRIMARY KEY ("order_id", "product_id")`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_d39c53244703b8534307adcd073"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_d39c53244703b8534307adcd073" UNIQUE ("address_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD CONSTRAINT "FK_dbc9dbab0eddd33834beeeb4d7d" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD CONSTRAINT "FK_6e7bae00c4b4e31e7ef7d87c3c4" FOREIGN KEY ("employee_create_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_d39c53244703b8534307adcd073" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_d39c53244703b8534307adcd073"`);
    await queryRunner.query(`ALTER TABLE "batches" DROP CONSTRAINT "FK_6e7bae00c4b4e31e7ef7d87c3c4"`);
    await queryRunner.query(`ALTER TABLE "batches" DROP CONSTRAINT "FK_dbc9dbab0eddd33834beeeb4d7d"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_d39c53244703b8534307adcd073"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_d39c53244703b8534307adcd073" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "PK_b2a13944a814f28f54b46f8754f"`);
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "PK_3ff3367344edec5de2355a562ee" PRIMARY KEY ("order_id")`,
    );
    await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "product_id"`);
    await queryRunner.query(`ALTER TABLE "order_details" ADD "product_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "PK_3ff3367344edec5de2355a562ee"`);
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "PK_b2a13944a814f28f54b46f8754f" PRIMARY KEY ("order_id", "product_id")`,
    );
    await queryRunner.query(`ALTER TABLE "cart_details" DROP CONSTRAINT "PK_692a50ed34d5df324da19279b60"`);
    await queryRunner.query(
      `ALTER TABLE "cart_details" ADD CONSTRAINT "PK_c81e3af806614bbf45024de3ca4" PRIMARY KEY ("cart_id")`,
    );
    await queryRunner.query(`ALTER TABLE "cart_details" DROP COLUMN "product_id"`);
    await queryRunner.query(`ALTER TABLE "cart_details" ADD "product_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cart_details" DROP CONSTRAINT "PK_c81e3af806614bbf45024de3ca4"`);
    await queryRunner.query(
      `ALTER TABLE "cart_details" ADD CONSTRAINT "PK_692a50ed34d5df324da19279b60" PRIMARY KEY ("cart_id", "product_id")`,
    );
    await queryRunner.query(`DROP TABLE "batches"`);
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_ce1f689e43b39edd9330cadaeb8" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_details" ADD CONSTRAINT "FK_9c56e71ba578cd23b493f4d1394" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
