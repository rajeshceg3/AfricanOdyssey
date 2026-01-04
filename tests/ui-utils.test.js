/**
 * @jest-environment jsdom
 */
import { openPanel, closePanel, updatePanelContent } from '../assets/js/ui-utils.js';

describe('UI Utils', () => {
  let panel;
  let closeBtn;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="info-panel">
        <div id="info-panel-content"></div>
        <button id="close-btn">Close</button>
      </div>
    `;
    panel = document.getElementById('info-panel');
    closeBtn = document.getElementById('close-btn');
  });

  test('openPanel should add active class and focus close button', (done) => {
    openPanel(panel, closeBtn);
    expect(panel.classList.contains('active')).toBe(true);
    expect(document.body.classList.contains('panel-active')).toBe(true);

    setTimeout(() => {
      expect(document.activeElement).toBe(closeBtn);
      done();
    }, 150);
  });

  test('closePanel should remove active class', () => {
    panel.classList.add('active');
    document.body.classList.add('panel-active');

    closePanel(panel);
    expect(panel.classList.contains('active')).toBe(false);
    expect(document.body.classList.contains('panel-active')).toBe(false);
  });

  test('updatePanelContent should populate content', () => {
    const container = document.getElementById('info-panel-content');
    const wonder = {
      name: 'Test Wonder',
      location: 'Test Location',
      description: 'Test Description',
      image: 'https://example.com/image.jpg',
    };

    updatePanelContent(container, wonder);

    expect(container.querySelector('h2').textContent).toBe(wonder.name);
    expect(container.querySelector('h3').textContent).toBe(wonder.location);
    expect(container.querySelector('p').textContent).toBe(wonder.description);
    expect(container.querySelector('img').src).toContain(wonder.image);
  });
});
