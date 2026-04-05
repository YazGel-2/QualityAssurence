// DB mock'u — hiçbir testte gerçek sorgu atılmaz
jest.mock('../Database/Connection', () => ({
    AppDataSource: {
        manager: {
            query: jest.fn(),
        },
    },
}));

// bcrypt mock'u — hiçbir testte gerçek hash işlemi yapılmaz
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

// Mock referanslarına kolay erişim için
import { AppDataSource } from '../Database/Connection';
import bcrypt from 'bcrypt';
const mockQuery = AppDataSource.manager.query as jest.Mock;
const mockHash  = bcrypt.hash as jest.Mock;

// Her testten önce mock'ları sıfırla
beforeEach(() => {
    mockQuery.mockReset();
    mockHash.mockReset();
});

// Service'i mock'lardan sonra import et
import * as UserService from '../Services/UserService';

// ─── 1. Validation — Şifre eksik ─────────────────────────────────────────────
describe('createUser — Validation', () => {
    it('şifre gönderilmezse AppError(400) fırlatmalı', async () => {
        await expect(
            UserService.createUser('testkullanici', '')
        ).rejects.toMatchObject({ status: 400 });

        // Validation düşmeli, DB'ye hiç sorgu gitmemeli
        expect(mockQuery).not.toHaveBeenCalled();
    });
});

// ─── 2. İş Kuralı — Duplicate username ───────────────────────────────────────
describe('createUser — İş Kuralı', () => {
    it('aynı username ile kayıt açılmak istendiğinde AppError(409) fırlatmalı', async () => {
        // DB mock'u: SELECT sorgusu mevcut kullanıcıyı döndürüyor
        mockQuery.mockResolvedValue([{ id: 1 }]);

        await expect(
            UserService.createUser('mevcutkullanici', 'sifre123')
        ).rejects.toMatchObject({
            status: 409,
            message: 'Username already exists',
        });

        // Kontrol sorgusu yapıldı ama INSERT atılmadı
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockHash).not.toHaveBeenCalled();
    });
});

// ─── 3. Servis Mantığı — bcrypt çağrısı ve hashli şifre ──────────────────────
describe('createUser — Servis Mantığı', () => {
    it('başarılı kayıtta bcrypt.hash çağrılmalı ve hashli şifre DB\'ye gitmeli', async () => {
        // İlk sorgu (SELECT): kullanıcı yok → boş dizi
        // İkinci sorgu (INSERT): yeni userId dön
        mockQuery
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce({ insertId: 7 });

        mockHash.mockResolvedValue('$2b$10$hashliSifre');

        const result = await UserService.createUser('yenikullanici', 'düzSifre123');

        // bcrypt.hash düz şifreyle çağrılmalı
        expect(mockHash).toHaveBeenCalledWith('düzSifre123', 10);

        // INSERT'e hashli şifre gitmeli, asla düz şifre değil
        expect(mockQuery).toHaveBeenCalledWith(
            'INSERT INTO user (username, password, role) VALUES (?, ?, ?)',
            ['yenikullanici', '$2b$10$hashliSifre', 'user']
        );

        expect(result).toEqual({ userId: 7 });
    });
});

// ─── 4. Hata Durumu — Olmayan userId ile silme ───────────────────────────────
describe('deleteUser — Hata Durumu', () => {
    it('olmayan userId ile silme işleminde AppError(404) fırlatmalı', async () => {
        // DB mock'u: hiçbir satır etkilenmedi
        mockQuery.mockResolvedValue({ affectedRows: 0 });

        await expect(
            UserService.deleteUser('999')
        ).rejects.toMatchObject({ status: 404 });

        expect(mockQuery).toHaveBeenCalledWith(
            'DELETE FROM user WHERE id = ?',
            ['999']
        );
    });
});
