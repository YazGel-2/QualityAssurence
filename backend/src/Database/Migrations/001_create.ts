import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE note (
        id INTEGER PRIMARY KEY ,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        userId INTEGER,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE note`);
    await queryRunner.query(`DROP TABLE user`);
  }
}

module.exports = InitTables1710000000000;