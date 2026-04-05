// DB, bcrypt ve JWT mock'ları — hiçbir testte gerçek işlem yapılmaz
jest.mock('../Database/Connection', () => ({
    AppDataSource: {
        manager: {
            query: jest.fn(),
        },
    },
}));

jest.mock('bcrypt', () => ({
    hash:    jest.fn(),
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign:   jest.fn(),
    verify: jest.fn(),
}));

// Mock referanslarına kolay erişim için
import { AppDataSource } from '../Database/Connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const mockQuery   = AppDataSource.manager.query as jest.Mock;
const mockHash    = bcrypt.hash    as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;
const mockSign    = jwt.sign       as jest.Mock;

// Her testten önce tüm mock'ları sıfırla
beforeEach(() => {
    mockQuery.mockReset();
    mockHash.mockReset();
    mockCompare.mockReset();
    mockSign.mockReset();
});

// Service'i mock'lardan sonra import et
import * as AuthService from '../Services/AuthService';

// ─── 1. Register — İş Kuralı (Duplicate) ─────────────────────────────────────
describe('registerUser — İş Kuralı', () => {
    it('kullanıcı zaten varsa AppError(409) fırlatmalı', async () => {
        // DB mock'u: SELECT mevcut kullanıcıyı buluyor
        mockQuery.mockResolvedValue([{ id: 1 }]);

        await expect(
            AuthService.registerUser('mevcutkullanici', 'sifre123')
        ).rejects.toMatchObject({
            status:  409,
            message: 'Username already exists',
        });

        // Duplicate bulunca bcrypt ve INSERT çağrılmamalı
        expect(mockHash).not.toHaveBeenCalled();
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });
});

// ─── 2. Login — Hata Durumu (Kullanıcı yok) ──────────────────────────────────
describe('loginUser — Hata Durumu', () => {
    it('kullanıcı adı DB\'de yoksa AppError(401) fırlatmalı', async () => {
        // DB mock'u: SELECT boş dizi döndürüyor
        mockQuery.mockResolvedValue([]);

        await expect(
            AuthService.loginUser('yokkullanici', 'sifre123')
        ).rejects.toMatchObject({ status: 401 });

        // Kullanıcı bulunamadı, şifre karşılaştırması yapılmamalı
        expect(mockCompare).not.toHaveBeenCalled();
    });

    // ─── 3. Login — Hata Durumu (Yanlış şifre) ───────────────────────────────
    it('şifre yanlışsa (bcrypt.compare false) AppError(401) fırlatmalı', async () => {
        // DB mock'u: kullanıcı bulundu
        mockQuery.mockResolvedValue([{
            id: 2, username: 'testkullanici', password: '$2b$10$hashliSifre', role: 'user',
        }]);
        // bcrypt mock'u: şifre eşleşmiyor
        mockCompare.mockResolvedValue(false);

        await expect(
            AuthService.loginUser('testkullanici', 'yanlisifre')
        ).rejects.toMatchObject({ status: 401 });

        // Yanlış şifre → JWT üretilmemeli
        expect(mockSign).not.toHaveBeenCalled();
    });
});

// ─── 4. Login — Başarı (Token üretimi) ───────────────────────────────────────
describe('loginUser — Başarı', () => {
    it('şifre doğruysa jwt.sign çağrılmalı ve token dönmeli', async () => {
        // DB mock'u: kullanıcı bulundu
        mockQuery.mockResolvedValue([{
            id: 3, username: 'testkullanici', password: '$2b$10$hashliSifre', role: 'user',
        }]);
        // bcrypt mock'u: şifre doğru
        mockCompare.mockResolvedValue(true);
        // JWT mock'u: sabit token döndür
        mockSign.mockReturnValue('mock.jwt.token');

        const result = await AuthService.loginUser('testkullanici', 'dogruSifre');

        // jwt.sign doğru payload ile çağrıldı mı?
        expect(mockSign).toHaveBeenCalledWith(
            { userId: 3, role: 'user' },
            'test-secret-key',                          // setup.ts'de tanımlanan JWT_SECRET
            expect.objectContaining({ expiresIn: '1d' })
        );

        // Servis token'ı döndürdü mü?
        expect(result).toEqual({ token: 'mock.jwt.token' });
    });
});
