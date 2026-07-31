import Speakers from './Svelte/Speakers.svelte';
import { createEmbedApi, injectStyles, readAttr } from './embedRuntime';

const MOUNT_SELECTOR = '[data-speakers]';

function parseCategories(rawCategories) {
  if (!rawCategories) {
    return '';
  }

  return rawCategories.trim();
}

function parseColumns(rawColumns) {
  const columns = Number.parseInt(String(rawColumns ?? ''), 10);

  if (!Number.isFinite(columns) || columns < 1) {
    return 0;
  }

  return columns;
}

function createSpeakersInstance(element) {
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  if (element.dataset.speakersMounted === 'true') {
    return null;
  }

  const event = element.getAttribute('data-speakers');
  const url = element.getAttribute('data-url');

  if (!event) {
    console.warn('Speakers embed skipped: missing required "data-speakers" attribute.', element);
    return null;
  }

  if (!url) {
    console.warn('Speakers embed skipped: missing required "data-url" attribute.', element);
    return null;
  }

  injectStyles();

  element.classList.add('speakers-embed');
  element.dataset.speakersMounted = 'true';

  const instance = new Speakers({
    target: element,
    props: {
      event,
      url,
      categories_filter: parseCategories(element.getAttribute('data-categories')),
      columns: parseColumns(element.getAttribute('data-columns')),
      border_color: readAttr(element, 'data-border', 'border-black'),
      bg_color: readAttr(element, 'data-bg', 'bg-white'),
      modal_bg_color: readAttr(element, 'data-modal-bg', 'bg-white'),
      text_color: readAttr(element, 'data-text', 'text-black'),
      speaker_border: readAttr(element, 'data-round', 'border-black'),
      category_color: readAttr(element, 'data-color-1', 'text-black'),
      sub_color: readAttr(element, 'data-color-2', 'text-black')
    }
  });

  element.__speakersEmbedInstance = instance;
  return instance;
}

const SpeakersEmbed = createEmbedApi({
  selector: MOUNT_SELECTOR,
  globalName: 'SpeakersEmbed',
  createInstance: createSpeakersInstance
});

export default SpeakersEmbed;
