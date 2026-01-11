import { fetchWonders } from './data.js';
import * as MapUtils from './map-utils.js';
import * as UIUtils from './ui-utils.js';

/**
 * Main application logic for the African Odyssey map.
 * Orchestrates interactions between the Map and the UI.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const infoPanel = document.getElementById('info-panel');
  const infoPanelContent = document.getElementById('info-panel-content');
  const panelCloseBtn = document.getElementById('panel-close-btn');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const mapContainer = document.getElementById('map');
  const startButton = document.getElementById('start-journey-btn');

  let map;
  let markers = [];
  let activeMarker = null;
  // FIX: UX-002 - State flag to prevent animation collisions
  let isAnimating = false;

  // FIX: ARCH-001 - Fetch data asynchronously
  let naturalWonders = [];
  try {
    naturalWonders = await fetchWonders();
  } catch (error) {
    console.error('Failed to load data:', error);
    UIUtils.showToast('Failed to load map data.', 'error');
  }

  // FIX: CODE-001 - Wrap initialization in try...catch for resilience
  try {
    // Initialize Map
    map = MapUtils.initMap('map');

    // Map Event Listeners for UX protection
    // FIX: UX-002 & UX-003 - Set animation flag on move and disable map interaction
    map.on('movestart', () => {
      isAnimating = true;
    });
    map.on('moveend', () => {
      isAnimating = false;
    });

    /**
     * Central handler for marker clicks.
     * @param {Object} wonder - The wonder data.
     * @param {Object} markerInstance - The clicked marker.
     */
    const handleMarkerClick = (wonder, markerInstance) => {
      // FIX: UX-002 - Block clicks during animation
      if (isAnimating) return;

      // Toggle logic: if clicking the same marker, close panel
      if (activeMarker === markerInstance) {
        handleClosePanel();
        return;
      }

      // 1. Move Map
      MapUtils.flyToLocation(map, wonder.lat, wonder.lng, 7);

      // 2. Update UI
      UIUtils.updatePanelContent(infoPanelContent, wonder);
      UIUtils.openPanel(infoPanel, panelCloseBtn);

      // 3. Update Markers Visual State
      MapUtils.highlightMarker(markerInstance, markers);
      activeMarker = markerInstance;

      // FIX: UX-003 - Disable map interaction when panel is open
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    };

    /**
     * Central handler for closing the panel.
     */
    const handleClosePanel = () => {
      // 1. Close UI
      UIUtils.closePanel(infoPanel);

      // 2. Reset Focus to Marker if active
      // FIX: UX-005 - Restore focus to the marker button for accessibility
      let focusRestored = false;
      if (activeMarker) {
        const markerEl = activeMarker.getElement();
        const markerBtn = markerEl ? markerEl.querySelector('.custom-marker') : null;

        // Check if marker is actually on screen (Leaflet removes off-screen markers)
        if (markerBtn && document.body.contains(markerBtn)) {
          markerBtn.focus();
          focusRestored = true;
        }
      }

      // Fallback focus if marker is not available
      if (!focusRestored && mapContainer) {
        mapContainer.focus();
      }

      // 3. Reset Markers Visual State
      MapUtils.resetMarkers(markers);
      activeMarker = null;

      // 4. Reset Map View
      MapUtils.flyToLocation(map, 2.8, 18.35, 4);

      // 5. Re-enable map interaction
      // FIX: UX-003 - Re-enable map interaction
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    };

    // Initialize Markers logic
    const initMarkers = () => {
      markers = MapUtils.addMarkers(map, naturalWonders, handleMarkerClick);
    };

    // Event Bindings
    panelCloseBtn.addEventListener('click', handleClosePanel);
    zoomInBtn.addEventListener('click', () => map.zoomIn());
    zoomOutBtn.addEventListener('click', () => map.zoomOut());

    // Keyboard Accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handleClosePanel();
    });

    // UX Enhancement: Start Button Logic
    if (startButton) {
      // Magnetic Effect Script
      startButton.addEventListener('mousemove', (e) => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const rect = startButton.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Deadzone check: only magnetize if we are well inside to avoid edge jitter
        // If mouse is too close to edge, treat as 0
        const isNearEdge = Math.abs(x) > rect.width / 2 - 5 || Math.abs(y) > rect.height / 2 - 5;

        if (isNearEdge) {
           startButton.style.transform = 'translate(0, 0)';
           return;
        }

        // Limit the movement to avoid it running away
        startButton.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      startButton.addEventListener('mouseleave', () => {
        startButton.style.transform = 'translate(0, 0)';
      });

      startButton.addEventListener('click', () => {
        welcomeOverlay.classList.add('hidden');

        // Ensure overlay is removed from accessibility tree after transition
        setTimeout(() => {
            welcomeOverlay.style.display = 'none';
            // FIX: UX-006 - Move focus to map container so keyboard users can navigate immediately
            mapContainer.focus();
        }, 1200); // Matches CSS transition duration

        // Trigger markers only after interaction to save resources and align with user intent
        setTimeout(initMarkers, 800);
      });
    } else {
      // Fallback if button missing
      setTimeout(() => {
        welcomeOverlay.classList.add('hidden');
        initMarkers();
      }, 3000);
    }
  } catch (error) {
    console.error('Non-critical initialization error:', error);
    // FIX: UX-007 - Use a toast notification
    UIUtils.showToast(
      'Map initialization experienced an issue. Some features may be limited.',
      'error'
    );
  }

  // FIX: PERF-003 - Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then(() => {
          // Registration successful
        })
        .catch((err) => {
          console.error('ServiceWorker registration failed: ', err);
        });
    });
  }
});
