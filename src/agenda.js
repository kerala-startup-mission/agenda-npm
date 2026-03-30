
import Agenda from './Svelte/Agenda.svelte';
import cssText from './embed.css?inline';

const STYLE_ID = 'agenda-embed-styles';
const MOUNT_SELECTOR = '[data-agenda]';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = cssText;
  document.head.appendChild(style);
}

function readAttr(element, name, fallback) {
  return element.hasAttribute(name) ? element.getAttribute(name) : fallback;
}

function createAgendaInstance(element) {
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  if (element.dataset.agendaMounted === 'true') {
    return null;
  }

  const event = element.getAttribute('data-agenda');
  const url = element.getAttribute('data-url');

  if (!event) {
    console.warn('Agenda embed skipped: missing required "data-agenda" attribute.', element);
    return null;
  }

  if (!url) {
    console.warn('Agenda embed skipped: missing required "data-url" attribute.', element);
    return null;
  }

  injectStyles();

  element.classList.add('agenda-embed');
  element.dataset.agendaMounted = 'true';

  const instance = new Agenda({
    target: element,
    props: {
      event,
      url,
      border_color: readAttr(element, 'data-border', 'border-black'),
      bg_color: readAttr(element, 'data-bg', 'bg-white'),
      select_color: readAttr(element, 'data-select', 'bg-gray-500 text-white border-gray-500'),
      text_color: readAttr(element, 'data-text', 'text-black'),
      speaker_border: readAttr(element, 'data-round', 'border-black'),
      category_color: readAttr(element, 'data-color-1', 'text-black'),
      sub_color: readAttr(element, 'data-color-2', 'text-black')
    }
  });

  element.__agendaEmbedInstance = instance;
  return instance;
}

function getMountNodes(root = document) {
  if (root instanceof HTMLElement && root.matches(MOUNT_SELECTOR)) {
    return [root, ...root.querySelectorAll(MOUNT_SELECTOR)];
  }

  if (root instanceof Document || root instanceof DocumentFragment || root instanceof HTMLElement) {
    return Array.from(root.querySelectorAll(MOUNT_SELECTOR));
  }

  return [];
}

function init(root) {
  return getMountNodes(root).map(createAgendaInstance).filter(Boolean);
}

const AgendaEmbed = {
  init
};

if (typeof window !== 'undefined') {
  window.AgendaEmbed = AgendaEmbed;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
}

export default AgendaEmbed;
