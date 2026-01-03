import { naturalWonders } from './data.js';

/**
 * Main application logic for the African Odyssey map.
 * Handles map initialization, marker creation, and user interactions.
 */
document.addEventListener('DOMContentLoaded', () => {
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const infoPanel = document.getElementById('info-panel');
  const infoPanelContent = document.getElementById('info-panel-content');
  const panelCloseBtn = document.getElementById('panel-close-btn');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const body = document.body;
  const mapContainer = document.getElementById('map');
  const startButton = document.getElementById('start-journey-btn');

  let markers = [];
  let activeMarker = null;
  // FIX: UX-002 - State flag to prevent animation collisions
  let isAnimating = false;

  // FIX: CODE-001 - Wrap initialization in try...catch for resilience
  try {
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: true,
      center: [2.8, 18.35],
      zoom: 4,
      minZoom: 3,
      maxZoom: 12,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      // FIX: SEC-004 - Open attribution links in new tab
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // FIX: UX-002 & UX-003 - Set animation flag on move and disable map interaction
    map.on('movestart', () => {
      isAnimating = true;
    });
    map.on('moveend', () => {
      isAnimating = false;
    });

    /**
     * Adds markers to the map based on the data.
     */
    const addMarkers = () => {
      naturalWonders.forEach((wonder, index) => {
        // FIX: SEC-002 - Create element programmatically to avoid unsafe-inline styles in innerHTML
        const markerBtn = document.createElement('button');
        markerBtn.type = 'button';
        markerBtn.className = 'custom-marker';
        markerBtn.style.setProperty('--marker-delay', `${0.2 + index * 0.1}s`);
        markerBtn.setAttribute('aria-label', `View details for ${wonder.name}`);
        // FIX: A11Y-001 - Add aria-expanded and aria-controls
        markerBtn.setAttribute('aria-expanded', 'false');
        markerBtn.setAttribute('aria-controls', 'info-panel');

        // FIX: UX-001 - Markers are now buttons for accessibility
        const markerIcon = L.divIcon({
          className: 'reset-button', // Reset button styles
          html: markerBtn,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const marker = L.marker([wonder.lat, wonder.lng], {
          icon: markerIcon,
          keyboard: true,
        }).addTo(map);
        marker.getElement().addEventListener('click', () => handleMarkerClick(wonder, marker));
        markers.push(marker);
      });
    };

    /**
     * Handles clicks on map markers.
     * @param {Object} wonder - The wonder data object.
     * @param {Object} markerInstance - The Leaflet marker instance.
     */
    const handleMarkerClick = (wonder, markerInstance) => {
      // FIX: UX-002 - Block clicks during animation
      if (isAnimating) return;
      if (activeMarker === markerInstance) {
        closePanel();
        return;
      }

      map.flyTo([wonder.lat, wonder.lng], 7, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.1,
      });
      updatePanelContent(wonder);
      openPanel();

      if (activeMarker) {
        activeMarker.getElement().querySelector('.custom-marker').classList.remove('active');
      }
      markers.forEach((m) =>
        m.getElement().querySelector('.custom-marker').classList.add('dimmed')
      );
      const markerBtn = markerInstance.getElement().querySelector('.custom-marker');
      markerBtn.classList.remove('dimmed');
      markerBtn.classList.add('active');
      markerBtn.setAttribute('aria-expanded', 'true');
      activeMarker = markerInstance;
    };

    /**
     * Updates the side panel content with the selected wonder's details.
     * @param {Object} wonder - The wonder data object.
     */
    const updatePanelContent = (wonder) => {
      // Clear existing content
      infoPanelContent.innerHTML = '';

      // Create Image Container
      const imgContainer = document.createElement('div');
      imgContainer.className = 'panel-image-container';

      const img = document.createElement('img');
      img.src = wonder.image;

      // FIX: PERF-002 - Implement responsive images with srcset
      const baseUrl = wonder.image.split('&w=')[0];
      if (baseUrl) {
        img.srcset = `${baseUrl}&w=400&q=80 400w, ${baseUrl}&w=800&q=80 800w, ${baseUrl}&w=1200&q=80 1200w`;
        img.sizes = '(max-width: 768px) 100vw, 420px';
      }

      img.alt = wonder.name;
      img.className = 'panel-image';
      img.loading = 'lazy';

      // FIX: SEC-003 & PERF-001 - Handle error safely via JS property
      img.onerror = () => {
        img.onerror = null; // Prevent infinite loop
        img.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(255,255,255,0.1)'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
      };

      imgContainer.appendChild(img);
      infoPanelContent.appendChild(imgContainer);

      // Decorative SVG
      const decorativeDiv = document.createElement('div');
      decorativeDiv.className = 'decorative-svg-corner';
      decorativeDiv.innerHTML = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M0 80 V 0 H 80" fill="none" stroke-opacity="0.3" stroke="var(--accent-color)" stroke-width="3"/></svg>`;
      infoPanelContent.appendChild(decorativeDiv);

      // Text Content
      const textContent = document.createElement('div');
      textContent.className = 'panel-text-content';

      const h2 = document.createElement('h2');
      h2.textContent = wonder.name;

      const h3 = document.createElement('h3');
      h3.textContent = wonder.location;

      const p = document.createElement('p');
      p.textContent = wonder.description;

      textContent.appendChild(h2);
      textContent.appendChild(h3);
      textContent.appendChild(p);

      infoPanelContent.appendChild(textContent);
    };

    /**
     * Opens the information panel.
     */
    const openPanel = () => {
      infoPanel.classList.add('active');
      body.classList.add('panel-active');
      // FIX: UX-003 - Disable map interaction when panel is open
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      // Ensure close button is accessible
      panelCloseBtn.focus();
    };

    /**
     * Closes the information panel and resets the view.
     */
    const closePanel = () => {
      infoPanel.classList.remove('active');
      body.classList.remove('panel-active');
      if (activeMarker) {
        // FIX: UX-005 - Restore focus to the marker button for accessibility
        const markerBtn = activeMarker.getElement().querySelector('.custom-marker');
        if (markerBtn) {
          markerBtn.focus();
          markerBtn.classList.remove('active');
          markerBtn.setAttribute('aria-expanded', 'false');
        }
        activeMarker = null;
      }
      markers.forEach((m) =>
        m.getElement().querySelector('.custom-marker').classList.remove('dimmed')
      );
      map.flyTo([2.8, 18.35], 4, { animate: true, duration: 1.5, easeLinearity: 0.1 });
      // FIX: UX-003 - Re-enable map interaction
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    };

    panelCloseBtn.addEventListener('click', closePanel);
    zoomInBtn.addEventListener('click', () => map.zoomIn());
    zoomOutBtn.addEventListener('click', () => map.zoomOut());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });

    // UX Enhancement: Start Button Logic
    if (startButton) {
      startButton.addEventListener('click', () => {
        welcomeOverlay.classList.add('hidden');
        // FIX: UX-006 - Move focus to map container so keyboard users can navigate immediately
        mapContainer.focus();
        // Trigger markers only after interaction to save resources and align with user intent
        setTimeout(addMarkers, 500);
      });
    } else {
      // Fallback if button missing
      setTimeout(() => {
        welcomeOverlay.classList.add('hidden');
        addMarkers();
      }, 3000);
    }
  } catch (error) {
    console.error('CRITICAL ERROR: Map initialization failed.', error);
    document.body.innerHTML =
      '<div style="color:white;text-align:center;padding-top:20%;">A critical error occurred. Unable to load the experience. Please check your connection and try again.</div>';
  }
});
