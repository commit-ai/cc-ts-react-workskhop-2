import request from 'supertest';
import app from '../src/app';
import { clearLog } from '../src/services/activityLog';

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
  });

  it('should return heroes with the expected shape', async () => {
    const response = await request(app).get('/api/superheroes');
    const hero = response.body[0];
    expect(hero).toHaveProperty('id');
    expect(hero).toHaveProperty('name');
    expect(hero).toHaveProperty('image');
    expect(hero).toHaveProperty('powerstats');
    expect(hero.powerstats).toHaveProperty('intelligence');
    expect(hero.powerstats).toHaveProperty('strength');
    expect(hero.powerstats).toHaveProperty('speed');
    expect(hero.powerstats).toHaveProperty('durability');
    expect(hero.powerstats).toHaveProperty('power');
    expect(hero.powerstats).toHaveProperty('combat');
  });
});

describe('GET /api/superheroes/:id', () => {
  it('should return a single superhero for a valid id', async () => {
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'A-Bomb');
    expect(response.body).toHaveProperty('image');
    expect(response.body).toHaveProperty('powerstats');
  });

  it('should return 400 for a non-integer id', async () => {
    const response = await request(app).get('/api/superheroes/abc');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for a float id', async () => {
    const response = await request(app).get('/api/superheroes/1.5');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for an id that does not exist', async () => {
    const response = await request(app).get('/api/superheroes/999999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /api/superheroes/search', () => {
  it('should return heroes whose name contains the query (case-insensitive)', async () => {
    const response = await request(app).get('/api/superheroes/search?name=man');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const names: string[] = response.body.map((h: { name: string }) => h.name);
    expect(names).toContain('Ant-Man');
    expect(names).toContain('Batman');
    expect(names).toContain('Iron Man');
    expect(names).toContain('Spider-Man');
    expect(names).not.toContain('Flash');
    expect(names).not.toContain('Hulk');
  });

  it('should be case-insensitive', async () => {
    const lower = await request(app).get('/api/superheroes/search?name=batman');
    const upper = await request(app).get('/api/superheroes/search?name=BATMAN');
    expect(lower.status).toBe(200);
    expect(upper.status).toBe(200);
    expect(lower.body.map((h: { name: string }) => h.name)).toContain('Batman');
    expect(upper.body.map((h: { name: string }) => h.name)).toContain('Batman');
  });

  it('should return an empty array when no heroes match', async () => {
    const response = await request(app).get('/api/superheroes/search?name=zzznomatch');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should return 400 when name query param is missing', async () => {
    const response = await request(app).get('/api/superheroes/search');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return heroes with the expected shape', async () => {
    const response = await request(app).get('/api/superheroes/search?name=batman');
    expect(response.status).toBe(200);
    const hero = response.body[0];
    expect(hero).toHaveProperty('id');
    expect(hero).toHaveProperty('name');
    expect(hero).toHaveProperty('image');
    expect(hero).toHaveProperty('powerstats');
  });
});

describe('GET /api/activity', () => {
  beforeEach(() => clearLog());

  it('should record a regular API request in the log', async () => {
    await request(app).get('/api/superheroes/1');
    const response = await request(app).get('/api/activity');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const entry = response.body.find((e: { path: string }) => e.path === '/api/superheroes/1');
    expect(entry).toBeDefined();
    expect(entry).toHaveProperty('method', 'GET');
    expect(entry).toHaveProperty('timestamp');
  });

  it('should return filtered results when ?path= is supplied', async () => {
    await request(app).get('/api/superheroes/1');
    await request(app).get('/api/superheroes/search?name=batman');
    const response = await request(app).get('/api/activity?path=search');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.every((e: { path: string }) => e.path.includes('search'))).toBe(true);
    expect(response.body.some((e: { path: string }) => e.path === '/api/superheroes/1')).toBe(false);
  });

  it('should never record the /api/activity endpoint itself', async () => {
    await request(app).get('/api/activity');
    await request(app).get('/api/activity?path=activity');
    const response = await request(app).get('/api/activity');
    expect(response.status).toBe(200);
    expect(response.body.every((e: { path: string }) => e.path !== '/api/activity')).toBe(true);
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
    expect(response.body).toHaveProperty('power');
    expect(response.body).toHaveProperty('combat');
  });

  it('should return 400 for a non-integer id', async () => {
    const response = await request(app).get('/api/superheroes/abc/powerstats');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for a float id', async () => {
    const response = await request(app).get('/api/superheroes/1.5/powerstats');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for an id that does not exist', async () => {
    const response = await request(app).get('/api/superheroes/999999/powerstats');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});
