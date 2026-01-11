/**
 * Map Utility functions for managing Leaflet map instance and markers.
 */

/**
 * Initializes the Leaflet map.
 * @param {string} elementId - The ID of the map container.
 * @returns {Object} The Leaflet map instance.
 */
export const initMap = (elementId) => {
  const map = L.map(elementId, {
    zoomControl: false,
    attributionControl: false,
    center: [2.8, 18.35],
    zoom: 4,
    minZoom: 3,
    maxZoom: 12,
  });

  // FIX: SEC-004 - Ensure attribution prefix is secure
  L.control.attribution({
    prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps" target="_blank" rel="noopener noreferrer">Leaflet</a>',
    position: 'bottomleft' // Match CSS styling
  }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    // FIX: SEC-004 - Open attribution links in new tab with proper rel attributes
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  return map;
};

/**
 * Adds markers to the map.
 * @param {Object} map - The Leaflet map instance.
 * @param {Array} data - Array of wonder objects.
 * @param {Function} onMarkerClick - Callback function when a marker is clicked.
 * @returns {Array} Array of created Leaflet markers.
 */
export const addMarkers = (map, data, onMarkerClick) => {
  const markers = [];
  data.forEach((wonder, index) => {
    // FIX: SEC-002 - Create element programmatically
    const markerBtn = document.createElement('button');
    markerBtn.type = 'button';
    markerBtn.className = 'custom-marker';
    markerBtn.style.setProperty('--marker-delay', `${0.2 + index * 0.1}s`);
    markerBtn.setAttribute('aria-label', `View details for ${wonder.name}`);
    // FIX: A11Y-001 - Add aria-expanded and aria-controls
    markerBtn.setAttribute('aria-expanded', 'false');
    markerBtn.setAttribute('aria-controls', 'info-panel');
    markerBtn.title = `Discover ${wonder.name}`;

    // FIX: UX-001 - Markers are buttons
    const markerIcon = L.divIcon({
      className: 'reset-button',
      html: markerBtn,
      iconSize: [24, 24], // Increased touch target size
      iconAnchor: [12, 12],
    });

    const marker = L.marker([wonder.lat, wonder.lng], {
      icon: markerIcon,
      keyboard: true,
      title: wonder.name,
    }).addTo(map);

    marker.bindTooltip(wonder.name, {
      direction: 'top',
      offset: [0, -10],
      className: 'custom-leaflet-tooltip',
      opacity: 1,
    });

    marker.getElement().addEventListener('click', () => {
      // Prevent event propagation if needed, but Leaflet handles it usually.
      // e.stopPropagation();
      onMarkerClick(wonder, marker);
    });

    markers.push(marker);
  });
  return markers;
};

/**
 * Highlights the active marker and dims others.
 * @param {Object} activeMarker - The marker to highlight.
 * @param {Array} allMarkers - All markers to potentially dim.
 */
export const highlightMarker = (activeMarker, allMarkers) => {
  // Reset all first
  allMarkers.forEach((m) => {
    const el = m.getElement().querySelector('.custom-marker');
    if (el) {
      el.classList.add('dimmed');
      el.classList.remove('active');
      el.setAttribute('aria-expanded', 'false');
    }
  });

  // Highlight active
  const activeEl = activeMarker.getElement().querySelector('.custom-marker');
  if (activeEl) {
    activeEl.classList.remove('dimmed');
    activeEl.classList.add('active');
    activeEl.setAttribute('aria-expanded', 'true');
  }
};

/**
 * Resets all markers to their default state.
 * @param {Array} allMarkers - All markers to reset.
 */
export const resetMarkers = (allMarkers) => {
  allMarkers.forEach((m) => {
    const el = m.getElement().querySelector('.custom-marker');
    if (el) {
      el.classList.remove('dimmed');
      el.classList.remove('active');
      el.setAttribute('aria-expanded', 'false');
    }
  });
};

/**
 * Flies the map to a specific location, respecting reduced motion.
 * @param {Object} map - The Leaflet map instance.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @param {number} zoom - Zoom level.
 */
export const flyToLocation = (map, lat, lng, zoom = 7) => {
  // FIX: A11Y-002 - Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  map.flyTo([lat, lng], zoom, {
    animate: !prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : 1.5,
    easeLinearity: 0.1,
  });
};
