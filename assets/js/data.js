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
    return await response.json();
  } catch (error) {
    console.error('Error fetching wonders:', error);
    return [];
  }
};
