import * as MapUtils from './map-utils.js';
import * as UIUtils from './ui-utils.js';

/**
 * Manages the guided tour experience.
 */
export class TourManager {
  constructor(map, data, markers) {
    this.map = map;
    this.data = data;
    this.markers = markers;
    this.currentStep = 0;
    this.isActive = false;
    this.tourCard = null;
    this.tourControls = null;

    // Bind methods
    this.startTour = this.startTour.bind(this);
    this.endTour = this.endTour.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);
  }

  init() {
    this.createStartButton();
  }

  createStartButton() {
    // Create FAB for starting tour
    const startBtn = document.createElement('button');
    startBtn.id = 'start-tour-btn';
    startBtn.className = 'tour-fab reset-button';
    startBtn.setAttribute('aria-label', 'Start Guided Tour');
    startBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span class="tooltip">Start Tour</span>
    `;

    startBtn.addEventListener('click', this.startTour);

    // Append to map container or body (using body to overlay map controls easily)
    document.body.appendChild(startBtn);
  }

  startTour() {
    if (this.isActive) return;
    this.isActive = true;
    this.currentStep = 0;

    // Add active class to body for styling hooks
    document.body.classList.add('tour-active');

    // Hide start button
    const startBtn = document.getElementById('start-tour-btn');
    if (startBtn) startBtn.classList.add('hidden');

    // Close any open panels
    const panel = document.getElementById('info-panel');
    if (panel && panel.classList.contains('active')) {
      UIUtils.closePanel(panel);
    }

    // Create Tour UI
    this.renderTourUI();

    // Start at first location
    this.updateStep(0);
  }

  endTour() {
    this.isActive = false;
    document.body.classList.remove('tour-active');

    // Show start button
    const startBtn = document.getElementById('start-tour-btn');
    if (startBtn) startBtn.classList.remove('hidden');

    // Remove UI
    if (this.tourCard) {
      this.tourCard.remove();
      this.tourCard = null;
    }

    // Reset Map View (Standard view)
    MapUtils.flyToLocation(this.map, 2.8, 18.35, 4);

    // Reset Markers
    MapUtils.resetMarkers(this.markers);
  }

  renderTourUI() {
    // Container for the card
    this.tourCard = document.createElement('div');
    this.tourCard.className = 'tour-card';
    this.tourCard.setAttribute('role', 'dialog');
    this.tourCard.setAttribute('aria-label', 'Tour Information');

    // Content will be injected in updateStep
    document.body.appendChild(this.tourCard);
  }

  updateStep(index) {
    if (index < 0 || index >= this.data.length) return;

    this.currentStep = index;
    const wonder = this.data[index];
    const marker = this.markers[index]; // Assuming direct mapping

    // 1. Map Movement (Smoother for tour)
    // We use the existing flyTo, but maybe we want a custom zoom for tours?
    // Let's stick to consistent 7 for now, or use map-utils default.
    MapUtils.flyToLocation(this.map, wonder.lat, wonder.lng, 7);

    // 2. Highlight Marker
    if (marker) {
      MapUtils.highlightMarker(marker, this.markers);
    }

    // 3. Update Card Content (Progressive Disclosure)
    this.renderCardContent(wonder);
  }

  renderCardContent(wonder) {
    if (!this.tourCard) return;

    // Progressive Disclosure:
    // Initially show Title, Location, and a "Snippet".
    // "Read More" expands to full description.

    // Extract a snippet (first sentence)
    const snippet = wonder.description.split('.')[0] + '.';

    this.tourCard.innerHTML = `
      <div class="tour-header">
        <span class="tour-progress">Stop ${this.currentStep + 1} of ${this.data.length}</span>
        <button class="tour-close-btn reset-button" aria-label="Exit Tour">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="tour-content">
        <h2 class="tour-title">${wonder.name}</h2>
        <div class="tour-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${wonder.location}
        </div>
        <p class="tour-snippet">${snippet}</p>

        <div class="tour-expanded-content hidden" id="tour-details-${this.currentStep}">
           <p>${wonder.description}</p>
           <div class="tour-image-preview">
             <img src="${wonder.image}" alt="${wonder.name}" loading="lazy" />
           </div>
        </div>

        <button class="tour-more-btn reset-button" aria-expanded="false" aria-controls="tour-details-${this.currentStep}">
          Tell me more
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      <div class="tour-controls">
        <button class="tour-nav-btn prev reset-button" ${this.currentStep === 0 ? 'disabled' : ''} aria-label="Previous Stop">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button class="tour-nav-btn next reset-button" aria-label="${this.currentStep === this.data.length - 1 ? 'Finish Tour' : 'Next Stop'}">
          ${this.currentStep === this.data.length - 1 ? 'Finish' : 'Next'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;

    // Bind Events
    this.bindCardEvents();
  }

  bindCardEvents() {
    const closeBtn = this.tourCard.querySelector('.tour-close-btn');
    const prevBtn = this.tourCard.querySelector('.tour-nav-btn.prev');
    const nextBtn = this.tourCard.querySelector('.tour-nav-btn.next');
    const moreBtn = this.tourCard.querySelector('.tour-more-btn');
    const expandedContent = this.tourCard.querySelector('.tour-expanded-content');

    closeBtn.addEventListener('click', this.endTour);

    if (prevBtn) {
      prevBtn.addEventListener('click', this.prevStep);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep === this.data.length - 1) {
          this.endTour();
        } else {
          this.nextStep();
        }
      });
    }

    if (moreBtn && expandedContent) {
      moreBtn.addEventListener('click', () => {
        const isExpanded = moreBtn.getAttribute('aria-expanded') === 'true';
        moreBtn.setAttribute('aria-expanded', !isExpanded);

        const snippet = this.tourCard.querySelector('.tour-snippet');

        if (isExpanded) {
          expandedContent.classList.add('hidden');
          if (snippet) snippet.classList.remove('hidden');
          moreBtn.innerHTML = `Tell me more <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
          this.tourCard.classList.remove('expanded');
        } else {
          expandedContent.classList.remove('hidden');
          if (snippet) snippet.classList.add('hidden');
          moreBtn.innerHTML = `Show less <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
          this.tourCard.classList.add('expanded');
        }
      });
    }
  }

  nextStep() {
    this.updateStep(this.currentStep + 1);
  }

  prevStep() {
    this.updateStep(this.currentStep - 1);
  }
}
