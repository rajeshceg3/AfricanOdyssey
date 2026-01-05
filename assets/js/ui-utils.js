/**
 * UI Utility functions for managing the information panel and notifications.
 * Handles DOM manipulation for the side panel, toast notifications, and overlay.
 */

/**
 * Updates the side panel content with the selected wonder's details.
 * @param {HTMLElement} contentContainer - The container for the panel content.
 * @param {Object} wonder - The wonder data object containing name, location, description, and image.
 */
export const updatePanelContent = (contentContainer, wonder) => {
  if (!contentContainer || !wonder) return;

  // Clear existing content
  contentContainer.innerHTML = '';

  // Create Image Container
  const imgContainer = document.createElement('div');
  imgContainer.className = 'panel-image-container loading'; // Start with loading state

  // Add loading spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  imgContainer.appendChild(spinner);

  const img = document.createElement('img');
  // Initial src for layout
  img.src = wonder.image;

  // FIX: PERF-002 - Implement responsive images with srcset
  try {
    const url = new URL(wonder.image);
    url.searchParams.delete('w');
    const baseUrl = url.toString();
    const separator = baseUrl.includes('?') ? '&' : '?';
    img.srcset = `${baseUrl}${separator}w=400&q=80 400w, ${baseUrl}${separator}w=800&q=80 800w, ${baseUrl}${separator}w=1200&q=80 1200w`;
    img.sizes = '(max-width: 768px) 100vw, 420px';
  } catch (e) {
    console.warn('Invalid image URL:', wonder.image);
  }

  img.alt = wonder.name;
  img.className = 'panel-image';
  img.loading = 'lazy';

  // Remove loading state when image loads
  img.onload = () => {
    imgContainer.classList.remove('loading');
  };

  // FIX: SEC-003 & PERF-001 - Handle error safely via JS property
  img.onerror = () => {
    img.onerror = null; // Prevent infinite loop
    imgContainer.classList.remove('loading'); // Remove spinner even on error
    img.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(255,255,255,0.1)'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
  };

  imgContainer.appendChild(img);
  contentContainer.appendChild(imgContainer);

  // Decorative SVG
  const decorativeDiv = document.createElement('div');
  decorativeDiv.className = 'decorative-svg-corner';
  decorativeDiv.innerHTML = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M0 80 V 0 H 80" fill="none" stroke-opacity="0.3" stroke="var(--accent-color)" stroke-width="3"/></svg>`;
  contentContainer.appendChild(decorativeDiv);

  // Text Content
  const textContent = document.createElement('div');
  textContent.className = 'panel-text-content';

  const h2 = document.createElement('h2');
  h2.textContent = wonder.name;

  const h3 = document.createElement('h3');
  // Add icon to location
  h3.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${wonder.location}`;

  const p = document.createElement('p');
  p.textContent = wonder.description;

  textContent.appendChild(h2);
  textContent.appendChild(h3);
  textContent.appendChild(p);

  contentContainer.appendChild(textContent);
};

/**
 * Opens the information panel and manages focus/attributes.
 * Implements a focus trap for accessibility.
 * @param {HTMLElement} panel - The panel element.
 * @param {HTMLElement} closeBtn - The close button element (to receive focus).
 */
export const openPanel = (panel, closeBtn) => {
  if (!panel) return;
  panel.classList.add('active');
  document.body.classList.add('panel-active');

  // Accessibility: Move focus to close button
  if (closeBtn) {
    // Small timeout to ensure transition doesn't interfere with focus visibility
    setTimeout(() => {
      closeBtn.focus();
      setupFocusTrap(panel);
    }, 100);
  }
};

/**
 * Sets up a focus trap within the provided element.
 * @param {HTMLElement} element - The element to trap focus within.
 */
const setupFocusTrap = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTab);

  // Store the handler on the element so we can remove it later if needed (simple implementation)
  element._focusTrapHandler = handleTab;
};

/**
 * Closes the information panel.
 * @param {HTMLElement} panel - The panel element.
 */
export const closePanel = (panel) => {
  if (!panel) return;
  panel.classList.remove('active');
  document.body.classList.remove('panel-active');

  // Remove focus trap listener
  if (panel._focusTrapHandler) {
    panel.removeEventListener('keydown', panel._focusTrapHandler);
    delete panel._focusTrapHandler;
  }
};

/**
 * Displays a non-intrusive error toast.
 * @param {string} message - The message to display.
 * @param {string} type - 'error' or 'info' (default: 'error').
 */
export const showToast = (message, type = 'error') => {
  // Remove existing toasts
  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;

  // Using classes is cleaner and CSP friendly
  toast.textContent = message;

  // Accessibility
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  document.body.appendChild(toast);

  // Trigger reflow for transition
  void toast.offsetWidth;
  toast.classList.add('visible');

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
};
