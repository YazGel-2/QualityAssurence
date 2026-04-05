import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcryptjs";

export class SeedData1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash("123456", 10);

    await queryRunner.query(
      `INSERT INTO user (username, password, role) VALUES (?, ?, ?)`,
      ["admin", password, "admin"]
    );

    // Users
    for (let i = 1; i <= 5; i++) {
      await queryRunner.query(
        `INSERT INTO user (username, password, role) VALUES (?, ?, ?)`,
        [`user${i}`, password, "user"]
      );
    }

    // seed datas
    const noteTemplates = [
      { title: "Alışveriş Listesi", content: "Süt, yumurta, ekmek ve kahve alınacak." },
      { title: "Günlük Plan", content: "Sabah sporu yap, projeyi bitir ve kitap oku." },
      { title: "Film Önerileri", content: "Inception, Interstellar ve The Prestige izlenecek." },
      { title: "Yazılım Notları", content: "TypeORM migrasyonları ve seed dataları öğren." },
      { title: "Gezilecek Yerler", content: "Kapadokya, Efes Antik Kenti ve Kaş planı yap." },
      { title: "Toplantı Notu", content: "Pazartesi saat 10:00'da ekip toplantısı var." },
      { title: "Spor Rutini", content: "45 dakika kardiyo ve ardından esneme hareketleri." },
      { title: "Yemek Tarifi", content: "Makarna sosu için domates, sarımsak ve fesleğen." },
      { title: "Kitap Listesi", content: "1984, Cesur Yeni Dünya ve Hayvan Çiftliği." },
      { title: "Haftalık Hedefler", content: "JavaScript derinlemesine çalış ve 2 blog yazısı yaz." }
    ];

    await queryRunner.query(
      `INSERT INTO note (title, content, userId) VALUES (?, ?, ?)`,
      ["Admin", "Ben adminim", 1]
    );

    for (let userId = 2; userId <= 6; userId++) {
      // random number for distributing the notes
      const noteCount = Math.floor(Math.random() * 6) + 5; 
      
      // shuffling the notes for randomness
      const shuffled = [...noteTemplates].sort(() => 0.5 - Math.random());
      const selectedNotes = shuffled.slice(0, noteCount);

      for (const note of selectedNotes) {
        await queryRunner.query(
          `INSERT INTO note (title, content, userId) VALUES (?, ?, ?)`,
          [note.title, note.content, userId]
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM note`);
    await queryRunner.query(`DELETE FROM user`);
  }
}