/**
 * Visual Utility functions for enhancing depth and immersion.
 * Provides DOM-based particle systems and parallax effects.
 */

/**
 * Initializes a lightweight CSS/DOM particle system for dust motes.
 * @param {string} containerId - The ID of the container element.
 * @param {number} count - The number of particles to generate.
 */
export const initParticles = (containerId = 'welcome-overlay', count = 30) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'dust-mote';

    // Randomize initial position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;

    // Randomize size and opacity for depth
    const size = Math.random() * 4 + 2; // 2px to 6px
    const opacity = Math.random() * 0.4 + 0.1; // 0.1 to 0.5

    // Randomize animation duration and delay
    const duration = Math.random() * 15 + 15; // 15s to 30s
    const delay = Math.random() * 5; // 0s to 5s

    particle.style.setProperty('--x', `${posX}vw`);
    particle.style.setProperty('--y', `${posY}vh`);
    particle.style.setProperty('--size', `${size}px`);
    particle.style.setProperty('--opacity', opacity);
    particle.style.setProperty('--duration', `${duration}s`);
    particle.style.setProperty('--delay', `${delay}s`);

    fragment.appendChild(particle);
  }

  container.appendChild(fragment);
};

/**
 * Initializes a subtle 3D parallax effect on elements based on mouse movement.
 * @param {string} containerId - The ID of the container listening for mouse events.
 * @param {string} targetSelector - CSS selector for elements to apply parallax to.
 */
export const initParallax = (containerId = 'welcome-overlay', targetSelector = 'h1, p') => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const targets = container.querySelectorAll(targetSelector);
  if (targets.length === 0) return;

  container.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
    const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

    targets.forEach((target, index) => {
      // Different elements move at different depths
      const depth = (index + 1) * 3;

      const rotateX = y * depth;
      const rotateY = -x * depth;

      // Apply subtle transform, ensure we don't overwrite existing transforms completely
      target.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    });
  });

  // Reset on leave
  container.addEventListener('mouseleave', () => {
    targets.forEach((target) => {
      target.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
      target.style.transition = 'transform 0.5s ease-out';

      // Clean up transition so it doesn't fight mousemove
      setTimeout(() => {
        target.style.transition = '';
      }, 500);
    });
  });
};
