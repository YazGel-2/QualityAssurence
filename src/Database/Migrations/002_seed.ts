import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcryptjs";

export class SeedData1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash("123456", 10);

    // Users
    for (let i = 1; i <= 5; i++) {
      await queryRunner.query(
        `INSERT INTO user (username, password, role) VALUES (?, ?, ?)`,
        [`user${i}`, password, "user"]
      );
    }

    await queryRunner.query(
      `INSERT INTO user (username, password, role) VALUES (?, ?, ?)`,
      ["admin", password, "admin"]
    );

    // Notes
    for (let i = 1; i <= 10; i++) {
      const userId = Math.floor(Math.random() * 5) + 1;

      await queryRunner.query(
        `INSERT INTO note (title, content, userId) VALUES (?, ?, ?)`,
        [`Note ${i}`, `Content ${i}`, userId]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM note`);
    await queryRunner.query(`DELETE FROM user`);
  }
}