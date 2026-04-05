process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1d";

import { test, expect, beforeAll, afterAll } from "vitest";
import request from 'supertest';
import { AppDataSource } from "../Database/Connection";
import { app } from '../index';

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
  await AppDataSource.initialize();
  await AppDataSource.manager.query("DELETE FROM user WHERE username = 'testuser'");
});

afterAll(async () => {
  await AppDataSource.destroy();
});

let createdNoteId: number = 0;
let createdUserId: number = 0;

test("register with valid credentials", async () => {
    let response = await request(app)
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
    
    createdUserId = response.body.userId;
    console.log('Created User ID:', createdUserId);
    expect(response.status).toBe(201);
});

test("login with valid credentials", async () => {
    let response = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.token).not.toBeNullable();
});

test("login with invalid credentials", async () => {
    let response = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'wrongpass' });

    expect(response.status).toBe(401);
});

test("create note with valid input", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
    let token = loginRes.body.token;

    let response = await request(app)
        .post('/note/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Note', content: 'This is a test note.' });

    createdNoteId = response.body.noteId;
    console.log('Created Note ID:', createdNoteId);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("noteId");
    expect(response.body.noteId).not.toBeNullable();
});

test("create note with invalid input", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
    let token = loginRes.body.token;

    let response = await request(app)
        .post('/note/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '', content: '' });

    expect(response.status).toBe(400);
});

test("get all notes", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
    let token = loginRes.body.token;

    let response = await request(app)
        .get('/note/getall')
        .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data
    .some((note: { title: string; content: string; }) => note.title === "Test Note" && note.content === "This is a test note."))
    .toBe(true);
});

test("get note by id", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
    let token = loginRes.body.token;

    console.log('Created Note ID2:', createdNoteId);

    let response = await request(app)
        .get(`/note/getnotebyid/${createdNoteId}`)
        .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
});

test("update note with valid input", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
    let token = loginRes.body.token;

    let responseUpdate = await request(app)
        .put(`/note/edit/${createdNoteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title', content: 'Updated Content' });

    let responseGet = await request(app)
        .get(`/note/getnotebyid/${createdNoteId}`)
        .set('Authorization', `Bearer ${token}`);

    expect(responseUpdate.status).toBe(200);
    expect(responseGet.body.title).toBe('Updated Title');
    expect(responseGet.body.content).toBe('Updated Content');
});

test("update note with invalid input", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
    let token = loginRes.body.token;

    let responseUpdate = await request(app)
        .put(`/note/edit/${createdNoteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '', content: '' });

    expect(responseUpdate.status).toBe(400);
});

test("delete note", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
    let token = loginRes.body.token;

    let responseDelete = await request(app)
        .delete(`/note/delete/${createdNoteId}`)
        .set('Authorization', `Bearer ${token}`);

    let responseGet = await request(app)
        .get(`/note/getnotebyid/${createdNoteId}`)
        .set('Authorization', `Bearer ${token}`);

    expect(responseDelete.status).toBe(204);
    expect(responseGet.status).toBe(404);
});

test("get all users with valid client_id", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: '123456' });
    let token = loginRes.body.token;

    let response = await request(app)
        .get('/user/getall')
        .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
});

test("get all users with invalid client_id", async () => {
    let loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
    let token = loginRes.body.token;

    let response = await request(app)
        .get('/user/getall')
        .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
});