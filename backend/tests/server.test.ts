import request from 'supertest';
import app from '../src/server';

process.env.TEST_PORT = '3002';

describe('GET /', () => {
  it('should respond with "Save the World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Save the World!');
  });
});

describe('GET /api/superheroes', () => {
  it('should return an array of superheroes', async () => {
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    const first = response.body[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('powerstats');
  });
});

describe('GET /api/superheroes/:id', () => {
  it('should return a superhero for a valid id', async () => {
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('powerstats');
  });

  it('should return 400 for a non-integer id', async () => {
    const response = await request(app).get('/api/superheroes/abc');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for an id that does not exist', async () => {
    const response = await request(app).get('/api/superheroes/999999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /api/superheroes/:id/powerstats', () => {
  it('should return powerstats for a valid id', async () => {
    const response = await request(app).get('/api/superheroes/1/powerstats');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('intelligence');
    expect(response.body).toHaveProperty('strength');
    expect(response.body).toHaveProperty('speed');
    expect(response.body).toHaveProperty('durability');
  });

  it('should return 400 for a non-integer id', async () => {
    const response = await request(app).get('/api/superheroes/abc/powerstats');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for an id that does not exist', async () => {
    const response = await request(app).get('/api/superheroes/999999/powerstats');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});

