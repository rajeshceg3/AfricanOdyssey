import { naturalWonders } from '../assets/js/data.js';

describe('Data Integrity Check', () => {
  test('should have an array of natural wonders', () => {
    expect(Array.isArray(naturalWonders)).toBe(true);
    expect(naturalWonders.length).toBeGreaterThan(0);
  });

  test('each wonder should have required properties', () => {
    naturalWonders.forEach((wonder, index) => {
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
