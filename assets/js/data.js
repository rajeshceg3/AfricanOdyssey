/**
 * Data handling for the African Natural Wonders map.
 * Fetches data from external JSON source.
 */

/**
 * Fetches the list of natural wonders.
 * @returns {Promise<Array<{
 *   name: string,
 *   location: string,
 *   lat: number,
 *   lng: number,
 *   description: string,
 *   image: string
 * }>>}
 */
export const fetchWonders = async () => {
  try {
    const response = await fetch('assets/data/wonders.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Validate schema
    if (!Array.isArray(data)) {
      throw new Error('Data is not an array');
    }

    return data.filter((item) => {
      const isValid =
        item &&
        typeof item.name === 'string' &&
        typeof item.location === 'string' &&
        typeof item.lat === 'number' &&
        typeof item.lng === 'number' &&
        typeof item.description === 'string' &&
        typeof item.image === 'string';

      if (!isValid) {
        console.warn('Invalid data item skipped:', item);
      }
      return isValid;
    });
  } catch (error) {
    console.error('Error fetching wonders:', error);
    return [];
  }
};
