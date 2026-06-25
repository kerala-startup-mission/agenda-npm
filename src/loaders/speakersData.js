import { fetchJsonOrThrow } from './request';

function buildSpeakersUrl({ url, event, categories = '' }) {
  const endpoint = new URL(`${url}/api/event/${event}/speakers`);

  if (categories) {
    endpoint.searchParams.set('category', categories);
  }

  return endpoint.toString();
}

export async function loadSpeakersData({ url, event, categories = '' }) {
  const endpoint = buildSpeakersUrl({ url, event, categories });
  const raw = await fetchJsonOrThrow(endpoint, 'Speakers');
  const speakers = Object.entries(raw).filter(([, speakers]) => Array.isArray(speakers) && speakers.length);

  return {
    raw,
    speakers
  };
}
