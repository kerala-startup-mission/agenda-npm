<script>
  import {onMount} from 'svelte';
  import SvelteMarkdown from 'svelte-markdown';
  import simplur from 'simplur';
  import { DateTime } from 'luxon';
  import {
    formatAgendaDate,
    formatAgendaTime,
    getVenuesForDate,
    loadAgendaData
  } from '../loaders/agendaData';
  import { loadSpeaker } from '../loaders/speakersData';
  import SpeakerModal from './SpeakerModal.svelte';


  export let event;
  export let url;
  export let border_color;
  export let select_color;
  export let text_color;
  export let bg_color;
  export let speaker_border;
  export let category_color;
  export let sub_color;

  let loading = true;
  let load_error = "";

  let data = null;
  let available_venues = [];

  let active_tab = "";
  let active_venue = "";

  let modal_open = false;
  let modal_loading = false;
  let modal_error = "";
  let active_speaker = null;

  async function openSpeaker(sp) {
    const hid = sp.id ?? sp.hid ?? sp.speaker_hid ?? sp.slug ?? sp.uuid;
    if (hid == null) {
      console.warn('Agenda: speaker has no id/hid field.', sp);
      return;
    }

    modal_open = true;
    modal_loading = true;
    modal_error = "";
    active_speaker = null;

    try {
      active_speaker = await loadSpeaker({ url, event, hid });
    } catch (error) {
      console.error('Agenda failed to load speaker detail.', error);
      modal_error = 'Unable to load the speaker right now.';
    } finally {
      modal_loading = false;
    }
  }

  async function loadData(){
    var today = DateTime.now().toFormat("LLL dd, yyyy");
    loading = true;
    load_error = "";

    try {
      data = await loadAgendaData({ url, event });
      active_tab = data.dates.indexOf(today) >= 0 ? today : data.dates[0] ?? "";
    } catch (error) {
      console.error('Agenda embed failed to load data.', error);
      load_error = "Unable to load the agenda right now.";
      data = null;
      active_tab = "";
      active_venue = "";
    } finally {
      loading = false;
    }

  }

  $: available_venues = data?.venuesByDate?.[active_tab];
  $: if (!available_venues?.length) {
    active_venue = "";
  } else if (!available_venues?.includes(active_venue)) {
    active_venue = available_venues[0];
  }

  onMount(async ()=>{
    await loadData();
  });

  function selectTab(date){
    active_tab = date;
  }

  function selectVenue(venue){
    active_venue = venue;
  }

</script>

{#if loading}
  <div class="agenda-loader">
    <div class="agenda-loader__spinner" aria-label="Loading agenda" role="status"></div>
  </div>
{:else if load_error}
  <div class="py-6 text-sm text-red-600">{load_error}</div>
{:else if !data?.dates?.length}
  <div class="py-6 text-sm {text_color}">No agenda is available.</div>
{:else}
  <div class="agenda__tabs text-center flex items-center justify-center flex-wrap gap-5 text-white mb-10">
    {#each data.dates as date}
      <button on:click={() => selectTab(date)} class="px-5 py-2 spl_cursor sm:text-base text-xs rounded-md shadow border {date == active_tab ? select_color : border_color + ' ' + text_color}">
        <span>{formatAgendaDate(date, 'ccc')}</span>, {formatAgendaDate(date, 'LLL d, y')}
      </button>
    {/each}
  </div>

  {#if available_venues?.length}
    <div class="agenda__tabs text-center flex items-center justify-center flex-wrap gap-5 text-white mb-10">
      {#each available_venues as venue}
        <button on:click={() => selectVenue(venue)} class="px-5 py-2 spl_cursor sm:text-base text-xs rounded-md shadow border {venue == active_venue ? select_color : border_color + ' ' + text_color}">
          <span>{venue}</span>
        </button>
      {/each}
    </div>
  {/if}

  <div id="event-sched1" data-title="Event Schedule">
    {#each Object.entries(data.agenda) as [date, agendas]}
      {#if date == active_tab}
        <div class="w-full max-w-4xl mx-auto mb-5">
          {#each Object.entries(agendas) as [venue, agenda]}
            {#if venue == active_venue}
              {#each agenda as {name, description, start_time, end_time, category, speakers, venue}}
                <div class="{bg_color} {border_color} border px-5 py-3">
                  <div class="flex flex-col md:flex-row md:space-x-5">
                    <div class="{text_color} md:pt-3 flex-shrink-0 min-w-[6rem]">{formatAgendaTime(start_time)} IST</div>

                    <div class="w-full divide-y divide-gray-600 space-y-4 mb-3">
                      <div class="w-full pt-3">
                        <div class="{category_color} uppercase text-xs">{category ?? ""}</div>
                        <div class="text-lg font-bold max-w-xl {text_color}">{name}</div>

                        {#if description}
                          <div class="mt-4 {text_color} mb-4">
                            <SvelteMarkdown source={description}></SvelteMarkdown>
                          </div>
                        {/if}

                        {#if Object.entries(speakers ?? {}).length}
                          <div class="mt-4 ml-4">
                            {#each Object.entries(speakers) as [category, speaker_list]}
                              <div class="font-bold uppercase {sub_color} mb-3">
                                {simplur`${[speaker_list.length, category]}[|s]`}
                              </div>

                              <div class="flex flex-wrap w-full">
                                {#each speaker_list as sp}
                                  <button
                                    type="button"
                                    class="flex items-center space-x-4 mb-3 pr-3 md:w-1/2 cursor-pointer border-0 bg-transparent p-0 text-left"
                                    aria-haspopup="dialog"
                                    on:click={() => openSpeaker(sp)}
                                  >
                                    <div class="rounded-full flex-shrink-0 w-20 border-r-4 border-b-4 {speaker_border} shadow-lg overflow-hidden">
                                      <img src={sp.photo} alt={sp.name} />
                                    </div>
                                    <div>
                                      <div class="font-bold {text_color}">{sp.name}</div>
                                      <div class="text-xs {sub_color}">{sp.designation}</div>
                                      <div class="text-xs {sub_color}">{sp.organisation ?? ""}</div>
                                    </div>
                                  </button>
                                {/each}
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          {/each}
        </div>
      {/if}
    {/each}
  </div>
{/if}

<SpeakerModal
  open={modal_open}
  loading={modal_loading}
  error={modal_error}
  speaker={active_speaker}
  {bg_color}
  {border_color}
  {text_color}
  {sub_color}
  {category_color}
  {speaker_border}
  on:select={(e) => openSpeaker({ id: e.detail })}
  on:close={() => (modal_open = false)}
/>

<style>
</style>
