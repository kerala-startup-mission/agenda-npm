import Agenda from './Svelte/Agenda.svelte';
import { createEmbedApi, injectStyles, readAttr } from './embedRuntime';

const MOUNT_SELECTOR = '[data-agenda]';

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

const AgendaEmbed = createEmbedApi({
  selector: MOUNT_SELECTOR,
  globalName: 'AgendaEmbed',
  createInstance: createAgendaInstance
});

export default AgendaEmbed;
