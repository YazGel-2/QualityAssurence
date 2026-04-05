import { AppError } from '../Services/NoteService';

// DB mock'u — hiçbir testte gerçek sorgu atılmaz
jest.mock('../Database/Connection', () => ({
    AppDataSource: {
        manager: {
            query: jest.fn(),
        },
    },
}));

// Mock referansına kolay erişim için
import { AppDataSource } from '../Database/Connection';
const mockQuery = AppDataSource.manager.query as jest.Mock;

// Her testten önce mock'u sıfırla
beforeEach(() => {
    mockQuery.mockReset();
});

// Service'i mock'tan sonra import et (mock önce kurulmalı)
import * as NoteService from '../Services/NoteService';

// ─── 1. Validation ────────────────────────────────────────────────────────────
describe('createNote — Validation', () => {
    it('boş title verildiğinde AppError(400) fırlatmalı', async () => {
        await expect(
            NoteService.createNote('', 'geçerli içerik', 1)
        ).rejects.toMatchObject({ status: 400 });
    });

    it('boş content verildiğinde AppError(400) fırlatmalı', async () => {
        await expect(
            NoteService.createNote('geçerli başlık', '', 1)
        ).rejects.toMatchObject({ status: 400 });
    });
});

// ─── 2. Yetkilendirme (AuthZ) ─────────────────────────────────────────────────
describe('createNote — Yetkilendirme', () => {
    it('userId verilmediğinde AppError(401) fırlatmalı', async () => {
        await expect(
            NoteService.createNote('başlık', 'içerik', 0)
        ).rejects.toMatchObject({ status: 401 });
    });
});

// ─── 3. Hata Durumu ───────────────────────────────────────────────────────────
describe('updateNote — Hata Durumu', () => {
    it('DB\'de bulunmayan noteId için AppError(404) fırlatmalı', async () => {
        // DB'nin "etkilenen satır yok" döndürmesi simüle ediliyor
        mockQuery.mockResolvedValue({ changes: 0 });

        await expect(
            NoteService.updateNote('999', 'yeni başlık', undefined)
        ).rejects.toMatchObject({ status: 404 });

        expect(mockQuery).toHaveBeenCalledTimes(1);
    });
});

// ─── 4. Servis Mantığı — Başarılı Create ──────────────────────────────────────
describe('createNote — Servis Mantığı', () => {
    it('geçerli verilerle çağrıldığında insertId\'yi döndürmeli', async () => {
        mockQuery.mockResolvedValue(42);

        const result = await NoteService.createNote('Test Başlık', 'Test İçerik', 7);

        expect(result).toEqual({ noteId: 42 });
        expect(mockQuery).toHaveBeenCalledWith(
            'INSERT INTO note (title, content, userId) VALUES (?, ?, ?)',
            ['Test Başlık', 'Test İçerik', 7]
        );
    });
});

// ─── 5. Servis Mantığı — Başarılı Delete ─────────────────────────────────────
describe('deleteNote — Servis Mantığı', () => {
    it('geçerli ID ile çağrıldığında hata fırlatmadan tamamlanmalı', async () => {
        mockQuery.mockResolvedValue({ changes: 1 });

        await expect(NoteService.deleteNote('5')).resolves.toBeUndefined();

        expect(mockQuery).toHaveBeenCalledWith(
            'DELETE FROM note WHERE id = ?',
            ['5']
        );
    });
});

// ─── 6. Servis Mantığı — getAllNotes ─────────────────────────────────────────
describe('getAllNotes — Servis Mantığı', () => {
    it('DB\'den dönen not listesini eksiksiz döndürmeli', async () => {
        const mockNotes = [
            { id: 1, title: 'Not 1', content: 'İçerik 1', userId: 3 },
            { id: 2, title: 'Not 2', content: 'İçerik 2', userId: 5 },
        ];
        mockQuery.mockResolvedValue(mockNotes);

        const result = await NoteService.getAllNotes();

        expect(result).toEqual(mockNotes);
        expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM note');
    });
});

// ─── 7. Hata Durumu — getMyNotes geçersiz userId ─────────────────────────────
describe('getMyNotes — Hata Durumu', () => {
    it('userId 0 veya falsy ise AppError(401) fırlatmalı', async () => {
        await expect(NoteService.getMyNotes(0)).rejects.toMatchObject({ status: 401 });

        // DB'ye hiç sorgu atılmamalı
        expect(mockQuery).not.toHaveBeenCalled();
    });
});
