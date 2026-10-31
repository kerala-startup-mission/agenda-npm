
import AgendaEmbed from './agendaEmbed';
import SpeakersEmbed from './speakersEmbed';
import { loadAgendaData } from './loaders/agendaData';
import { loadSpeakersData, loadSpeaker } from './loaders/speakersData';
import { generateAgendaPdf } from './loaders/agendaPdf';
import SpeakerModal from './Svelte/SpeakerModal.svelte';

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

export { AgendaEmbed, SpeakersEmbed, loadAgendaData, loadSpeakersData, loadSpeaker, generateAgendaPdf, SpeakerModal };
export default AgendaEmbed;
