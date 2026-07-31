import { fetchJsonOrThrow } from './request';
import { DateTime } from 'luxon';

export function formatAgendaDate(date, format) {
  const parsedDate = DateTime.fromFormat(date, 'LLL dd, yyyy');
  return parsedDate.toFormat(format);
}

export function formatAgendaTime(date) {
  const parsedDate = DateTime.fromSQL(date);
  return parsedDate.toFormat('hh:mm a');
}

export function formatAgendaDateTime(date) {
  const parsedDate = DateTime.fromSQL(date);
  return parsedDate.toFormat('LLL d · hh:mm a');
}

export function formatAgendaTimeRange(start, end) {
  const startDate = DateTime.fromSQL(start);
  const endDate = DateTime.fromSQL(end);

  if (startDate.hasSame(endDate, 'day')) {
    return `${startDate.toFormat('hh:mm a')} - ${endDate.toFormat('hh:mm a')}`;
  }

  return `${startDate.toFormat('hh:mm a')} - ${endDate.toFormat('hh:mm a')}`;
}

export function getVenuesForDate(agenda, date) {
  return Object.keys(agenda?.[date] ?? {}).filter((venue) => {
    const items = agenda?.[date]?.[venue];
    return Array.isArray(items) ? items.length > 0 : Boolean(items);
  });
}

export function getVenuesByDate(agenda) {
  return Object.fromEntries(
    Object.keys(agenda).map((date) => [
      date,
      getVenuesForDate(agenda, date)
    ])
  );
}

export async function loadAgendaData({ url, event }) {
  const endpoint = `${url}/api/event/${event}/agenda/venue`;
  const raw = await fetchJsonOrThrow(endpoint, 'Agenda');
  const agenda = raw.agenda ?? {};
  const categories = raw.categories ?? [];
  const venues = raw.venues ?? [];
  const dates = Object.keys(agenda);
  const venuesByDate = getVenuesByDate(agenda);

  return {
    raw,
    agenda,
    categories,
    venues,
    dates,
    venuesByDate
  };
}
