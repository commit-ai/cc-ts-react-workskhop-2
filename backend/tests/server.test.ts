import request from 'supertest';
import app from '../src/server';

process.env.TEST_PORT = '3002'; // Set the test port

describe('GET /', () => {
  it('should respond with "Save the World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Save the World!');
  });
});

describe('GET /api/superheroes', () => {
  it('should sort superheroes by name in ascending order', async () => {
    const response = await request(app).get('/api/superheroes?sortBy=name&order=asc');

    expect(response.status).toBe(200);
    expect(response.body[0].name.localeCompare(response.body[1].name)).toBeLessThanOrEqual(0);
    expect(response.body[1].name.localeCompare(response.body[2].name)).toBeLessThanOrEqual(0);
  });

  it('should sort superheroes by power in descending order', async () => {
    const response = await request(app).get('/api/superheroes?sortBy=power&order=desc');

    expect(response.status).toBe(200);
    expect(response.body[0].powerstats.power).toBeGreaterThanOrEqual(response.body[1].powerstats.power);
    expect(response.body[1].powerstats.power).toBeGreaterThanOrEqual(response.body[2].powerstats.power);
  });
});
