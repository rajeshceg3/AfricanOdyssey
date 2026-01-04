import { naturalWonders } from './data.js';
import * as MapUtils from './map-utils.js';
import * as UIUtils from './ui-utils.js';

/**
 * Main application logic for the African Odyssey map.
 * Orchestrates interactions between the Map and the UI.
 */
document.addEventListener('DOMContentLoaded', () => {
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
      if (activeMarker) {
        const markerBtn = activeMarker.getElement().querySelector('.custom-marker');
        if (markerBtn) {
          markerBtn.focus();
        }
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
      startButton.addEventListener('click', () => {
        welcomeOverlay.classList.add('hidden');
        // FIX: UX-006 - Move focus to map container so keyboard users can navigate immediately
        mapContainer.focus();
        // Trigger markers only after interaction to save resources and align with user intent
        setTimeout(initMarkers, 500);
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
          // console.log('ServiceWorker registration successful');
        })
        .catch((err) => {
          console.error('ServiceWorker registration failed: ', err);
        });
    });
  }
});
