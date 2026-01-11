import { fetchWonders } from '../assets/js/data.js';

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        name: 'Serengeti National Park',
        location: 'Tanzania',
        lat: -2.3333,
        lng: 34.8333,
        description: 'Test Description',
        image: 'https://example.com/image.jpg'
      }
    ]),
  })
);

describe('Data Integrity Check', () => {
  let naturalWonders;

  beforeAll(async () => {
    naturalWonders = await fetchWonders();
  });

  test('should have an array of natural wonders', () => {
    expect(Array.isArray(naturalWonders)).toBe(true);
    expect(naturalWonders.length).toBeGreaterThan(0);
  });

  test('each wonder should have required properties', () => {
    naturalWonders.forEach((wonder) => {
      expect(wonder).toHaveProperty('name');
      expect(typeof wonder.name).toBe('string');

      expect(wonder).toHaveProperty('location');
      expect(typeof wonder.location).toBe('string');

      expect(wonder).toHaveProperty('lat');
      expect(typeof wonder.lat).toBe('number');

      expect(wonder).toHaveProperty('lng');
      expect(typeof wonder.lng).toBe('number');

      expect(wonder).toHaveProperty('description');
      expect(typeof wonder.description).toBe('string');

      expect(wonder).toHaveProperty('image');
      expect(typeof wonder.image).toBe('string');
      expect(wonder.image).toMatch(/^https?:\/\//);
    });
  });

  test('coordinates should be valid', () => {
    naturalWonders.forEach((wonder) => {
      expect(wonder.lat).toBeGreaterThanOrEqual(-90);
      expect(wonder.lat).toBeLessThanOrEqual(90);
      expect(wonder.lng).toBeGreaterThanOrEqual(-180);
      expect(wonder.lng).toBeLessThanOrEqual(180);
    });
  });
});
