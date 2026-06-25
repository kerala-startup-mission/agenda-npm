
import AgendaEmbed from './agendaEmbed';
import SpeakersEmbed from './speakersEmbed';
import { loadAgendaData } from './loaders/agendaData';
import { loadSpeakersData } from './loaders/speakersData';

function initAll() {
  AgendaEmbed.init();
  SpeakersEmbed.init();
}

if (typeof window !== 'undefined') {
  window.AgendaEmbed = AgendaEmbed;
  window.SpeakersEmbed = SpeakersEmbed;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll(), { once: true });
  } else {
    initAll();
  }
}

export { AgendaEmbed, SpeakersEmbed, loadAgendaData, loadSpeakersData };
export default AgendaEmbed;
